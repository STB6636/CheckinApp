import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const WORKSPACE_ROOT = process.cwd();
const MAP_DIR = path.join(WORKSPACE_ROOT, '.ai_map');
const OUTPUT_JSON = path.join(MAP_DIR, 'CODE_INDEX.json');
const OUTPUT_MD = path.join(MAP_DIR, '01_FILE_FUNCTION_INDEX.md');

const TARGET_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.py', '.gs', '.html', '.sql']);
const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 'out', 'coverage',
  '.vscode', '.ai_map', '.agents', 'AI Work Flow',
  'second_brain_vault', 'ai_skills_registry', '__pycache__', '.venv', 'images'
]);

/**
 * คำนวณ SHA-256 Hash ของเนื้อหาไฟล์เพื่อตรวจสอบว่าไฟล์มีการเปลี่ยนแปลงหรือไม่
 */
function computeFileHash(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex').slice(0, 16);
}

/**
 * ระบุ Layer ของไฟล์ตามโครงสร้างโปรเจกต์
 */
function detectFileLayer(relativePath) {
  if (relativePath.startsWith('assets/js/core/')) return 'Core Service & Infrastructure Layer';
  if (relativePath.startsWith('assets/js/models/')) return 'Data Model & Supabase Repository Layer';
  if (relativePath.startsWith('assets/js/controllers/')) return 'Frontend Page Controller Layer (OOP)';
  if (relativePath.startsWith('assets/js/components/')) return 'Shared UI Component Layer';
  if (relativePath.startsWith('google_apps_script/')) return 'Google Apps Script Serverless Bridge';
  if (relativePath.startsWith('sql/')) return 'Database Schema & Migration Layer (PostgreSQL/Supabase)';
  if (relativePath.endsWith('.html')) return 'Frontend HTML View & Entry Point';
  return 'Application Module';
}

/**
 * ดึงคำอธิบายจากคอมเมนต์เหนือฟังก์ชัน/เมธอด (ถ้ามี)
 */
function extractPrecedingComment(lines, lineIndex) {
  for (let k = lineIndex - 1; k >= Math.max(0, lineIndex - 6); k--) {
    const raw = lines[k].trim();
    if (!raw || raw === '*/' || raw === '/**') continue;
    if (raw.startsWith('//')) {
      return raw.replace(/^\/\/\s*/, '').trim();
    }
    if (raw.startsWith('*') && !raw.startsWith('*/')) {
      const cleaned = raw.replace(/^\*\s*/, '').trim();
      if (!cleaned.startsWith('@param') && !cleaned.startsWith('@returns') && !cleaned.startsWith('@file')) {
        return cleaned.replace(/^@description\s*/, '');
      }
    }
    break;
  }
  return '';
}

/**
 * ค้นหาไฟล์ซอร์สโค้ดทั้งหมดในโปรเจกต์แบบ Recursive
 */
function walkDirectory(dirPath, fileList = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkDirectory(fullPath, fileList);
    } else if (entry.isFile() && TARGET_EXTENSIONS.has(path.extname(entry.name))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

/**
 * หาบรรทัดสิ้นสุดของบล็อกโค้ดแบบวงเล็บปีกกา { ... } สำหรับ JS/TS/React/GAS
 */
function findBraceBlockEndLine(lines, startLineIndex) {
  let braceDepth = 0;
  let foundOpeningBrace = false;

  for (let i = startLineIndex; i < lines.length; i++) {
    const line = lines[i];
    // ลบ Regex literal, String และ Comment เบื้องต้นเพื่อไม่ให้นับปีกกาผิดพลาด
    const cleanedLine = line
      .replace(/\/\/.*$/g, '')
      .replace(/(['"`])(?:\\.|(?!\1)[^\\])*\1/g, '');

    for (const char of cleanedLine) {
      if (char === '{') {
        braceDepth++;
        foundOpeningBrace = true;
      } else if (char === '}') {
        braceDepth--;
      }
    }

    if (foundOpeningBrace && braceDepth <= 0) {
      return i + 1; // คืนค่าเป็นเลขบรรทัดแบบ 1-based
    }
  }
  return lines.length;
}

/**
 * หาบรรทัดสิ้นสุดของบล็อกโค้ดแบบ Indentation สำหรับ Python
 */
function findPythonBlockEndLine(lines, startLineIndex) {
  const startLine = lines[startLineIndex];
  const baseIndentMatch = startLine.match(/^(\s*)/);
  const baseIndent = baseIndentMatch ? baseIndentMatch[1].length : 0;

  let lastContentLine = startLineIndex + 1;
  for (let i = startLineIndex + 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;

    const currentIndentMatch = rawLine.match(/^(\s*)/);
    const currentIndent = currentIndentMatch ? currentIndentMatch[1].length : 0;

    if (currentIndent <= baseIndent) {
      return lastContentLine;
    }
    lastContentLine = i + 1;
  }
  return lastContentLine;
}

/**
 * สกัด Imports, Exports, Classes, Functions, React Components, HTML Views และ SQL Schema จากไฟล์
 */
function analyzeSourceFile(filePath) {
  const relativePath = path.relative(WORKSPACE_ROOT, filePath).replace(/\\/g, '/');
  const ext = path.extname(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const fileHash = computeFileHash(content);
  const layer = detectFileLayer(relativePath);

  const imports = [];
  const exportsList = [];
  const symbols = [];

  if (ext === '.py') {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
        imports.push(trimmed);
        continue;
      }

      const pyClassMatch = line.match(/^\s*class\s+([A-Za-z0-9_]+)\s*(\([^)]*\))?\s*:/);
      if (pyClassMatch) {
        const endLine = findPythonBlockEndLine(lines, i);
        symbols.push({
          name: pyClassMatch[1],
          kind: 'python_class',
          startLine: i + 1,
          endLine,
          signature: trimmed.replace(/:$/, ''),
          summary: `Python Class (${endLine - i} lines)`
        });
        continue;
      }

      const pyFuncMatch = line.match(/^\s*(async\s+)?def\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*(->\s*[^:]+)?\s*:/);
      if (pyFuncMatch) {
        const endLine = findPythonBlockEndLine(lines, i);
        const isAsync = Boolean(pyFuncMatch[1]);
        const funcName = pyFuncMatch[2];
        const params = pyFuncMatch[3].trim();
        const returnType = pyFuncMatch[4] ? pyFuncMatch[4].replace('->', '').trim() : 'Any';
        symbols.push({
          name: funcName,
          kind: isAsync ? 'async_def' : 'def',
          startLine: i + 1,
          endLine,
          signature: `(${params}) -> ${returnType}`,
          summary: `Python Function L${i + 1}-L${endLine}`
        });
      }
    }
  } else if (ext === '.html') {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      const importMatch = trimmed.match(/import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"]/);
      if (importMatch) {
        imports.push(importMatch[0]);
      }

      // ตรวจจับบล็อกหลักใน HTML: <head>, <main>, <aside>, <div id="...Modal">, <script type="module">
      const tagMatch = line.match(/^\s*<(head|main|aside|nav|script|form|div)\b([^>]*)>/i);
      if (tagMatch) {
        const tag = tagMatch[1].toLowerCase();
        const attrs = tagMatch[2] || '';
        const idMatch = attrs.match(/\bid=["']([^"']+)["']/i);
        const isModuleScript = tag === 'script' && /type=["']module["']/i.test(attrs);
        const isImportantBlock =
          tag === 'head' ||
          tag === 'main' ||
          isModuleScript ||
          (idMatch && /(Modal|Form|Section|Container|View|Card|Table|Wrapper|Overlay|Panel)$/i.test(idMatch[1]));

        if (isImportantBlock) {
          let endLine = i + 1;
          const closeRegex = new RegExp(`</${tag}\\s*>`, 'i');
          if (!closeRegex.test(line)) {
            let depth = 1;
            const openRegex = new RegExp(`<${tag}\\b`, 'i');
            for (let j = i + 1; j < lines.length; j++) {
              if (openRegex.test(lines[j])) depth++;
              if (closeRegex.test(lines[j])) {
                depth--;
                if (depth <= 0) {
                  endLine = j + 1;
                  break;
                }
              }
            }
          }
          const symbolName = isModuleScript
            ? '<script type="module"> (Page Bootstrap)'
            : idMatch
              ? `<${tag}#${idMatch[1]}>`
              : `<${tag}>`;
          symbols.push({
            name: symbolName,
            kind: isModuleScript ? 'html_module_script' : 'html_dom_section',
            startLine: i + 1,
            endLine,
            signature: idMatch ? `id="${idMatch[1]}"` : `<${tag}>`,
            summary: isModuleScript
              ? `Bootstrap script L${i + 1}-L${endLine}`
              : `HTML DOM Section L${i + 1}-L${endLine}`
          });
        }
      }
    }
  } else if (ext === '.sql') {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      const tableMatch = trimmed.match(/^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([A-Za-z0-9_.]+)/i);
      const alterMatch = trimmed.match(/^ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?([A-Za-z0-9_.]+)/i);
      const policyMatch = trimmed.match(/^CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+([A-Za-z0-9_.]+)/i);
      const funcSqlMatch = trimmed.match(/^CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+([A-Za-z0-9_.]+)/i);
      const insertMatch = trimmed.match(/^INSERT\s+INTO\s+([A-Za-z0-9_.]+)/i);

      if (tableMatch || alterMatch || policyMatch || funcSqlMatch || insertMatch) {
        let endLine = i + 1;
        for (let j = i; j < lines.length; j++) {
          if (lines[j].trim().endsWith(';')) {
            endLine = j + 1;
            break;
          }
        }
        if (tableMatch) {
          symbols.push({
            name: `TABLE ${tableMatch[1]}`,
            kind: 'sql_table',
            startLine: i + 1,
            endLine,
            signature: `CREATE TABLE ${tableMatch[1]}`,
            summary: `DDL Table Definition L${i + 1}-L${endLine}`
          });
        } else if (alterMatch) {
          symbols.push({
            name: `ALTER ${alterMatch[1]} (L${i + 1})`,
            kind: 'sql_alter',
            startLine: i + 1,
            endLine,
            signature: trimmed.slice(0, 60),
            summary: `Schema Alteration L${i + 1}-L${endLine}`
          });
        } else if (policyMatch) {
          symbols.push({
            name: `POLICY "${policyMatch[1]}" ON ${policyMatch[2]}`,
            kind: 'sql_rls_policy',
            startLine: i + 1,
            endLine,
            signature: `ON ${policyMatch[2]}`,
            summary: `Supabase RLS Policy L${i + 1}-L${endLine}`
          });
        } else if (funcSqlMatch) {
          symbols.push({
            name: `FUNCTION ${funcSqlMatch[1]}`,
            kind: 'sql_function',
            startLine: i + 1,
            endLine,
            signature: `CREATE FUNCTION ${funcSqlMatch[1]}`,
            summary: `SQL Stored Function L${i + 1}-L${endLine}`
          });
        } else if (insertMatch) {
          symbols.push({
            name: `SEED ${insertMatch[1]} (L${i + 1})`,
            kind: 'sql_seed',
            startLine: i + 1,
            endLine,
            signature: `INSERT INTO ${insertMatch[1]}`,
            summary: `Seed Data Statement L${i + 1}-L${endLine}`
          });
        }
      }
    }
  } else {
    // สำหรับไฟล์ .ts, .tsx, .js, .jsx, .mjs, .gs (Web / Web App / OOP ES2022)
    let currentClassName = null;
    let currentClassEndLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (currentClassName && i + 1 > currentClassEndLine) {
        currentClassName = null;
      }

      // ตรวจจับ Imports
      if (trimmed.startsWith('import ')) {
        imports.push(trimmed);
      }

      // ตรวจจับ Exports
      if (trimmed.startsWith('export ')) {
        const exportNameMatch = trimmed.match(/^export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|interface|type)\s+([A-Za-z0-9_]+)/);
        if (exportNameMatch) {
          exportsList.push(exportNameMatch[1]);
        }
      }

      // 1. ตรวจจับ Class Declaration
      const classMatch = line.match(/^\s*(?:export\s+)?(?:default\s+)?(?:abstract\s+)?class\s+([A-Za-z0-9_]+)(?:\s+extends\s+[A-Za-z0-9_.<>]+)?(?:\s+implements\s+[^{]+)?\s*\{/);
      if (classMatch) {
        const endLine = findBraceBlockEndLine(lines, i);
        currentClassName = classMatch[1];
        currentClassEndLine = endLine;
        const comment = extractPrecedingComment(lines, i);
        symbols.push({
          name: classMatch[1],
          kind: 'class',
          startLine: i + 1,
          endLine,
          signature: trimmed.replace(/\{.*$/, '').trim(),
          summary: comment || `Class Definition (${endLine - i} lines)`
        });
        continue;
      }

      // 2. ตรวจจับ Standard Function / React Component Declaration
      const funcMatch = line.match(/^\s*(?:export\s+)?(?:default\s+)?(async\s+)?function\s+([A-Za-z0-9_]+)\s*(?:<[^>]*>)?\s*\(([^)]*)\)\s*(?::\s*([^{]+))?\s*\{/);
      if (funcMatch) {
        const endLine = findBraceBlockEndLine(lines, i);
        const isAsync = Boolean(funcMatch[1]);
        const name = funcMatch[2];
        const params = funcMatch[3].trim();
        const returnType = funcMatch[4] ? funcMatch[4].trim() : 'inferred';
        const isReactComponent = /^[A-Z]/.test(name) && (ext === '.tsx' || ext === '.jsx');
        const comment = extractPrecedingComment(lines, i);
        symbols.push({
          name,
          kind: isReactComponent ? 'react_component' : (isAsync ? 'async_function' : 'function'),
          startLine: i + 1,
          endLine,
          signature: `(${params}) => ${returnType}`,
          summary: comment || (isReactComponent ? `React UI Component L${i + 1}-L${endLine}` : `Function L${i + 1}-L${endLine}`)
        });
        continue;
      }

      // 3. ตรวจจับ Arrow Function / Custom Hook / Next.js Route Handler
      const arrowMatch = line.match(/^\s*(?:export\s+)?(?:const|let)\s+([A-Za-z0-9_]+)\s*(?::\s*[^=]+)?\s*=\s*(async\s+)?(?:<[^>]*>)?\s*\(([^)]*)\)\s*(?::\s*([^=]+))?\s*=>\s*\{/);
      if (arrowMatch) {
        const endLine = findBraceBlockEndLine(lines, i);
        const name = arrowMatch[1];
        const isAsync = Boolean(arrowMatch[2]);
        const params = arrowMatch[3].trim();
        const returnType = arrowMatch[4] ? arrowMatch[4].trim() : 'inferred';
        const isHook = /^use[A-Z]/.test(name);
        const isComponent = /^[A-Z]/.test(name) && (ext === '.tsx' || ext === '.jsx');
        const comment = extractPrecedingComment(lines, i);
        symbols.push({
          name,
          kind: isHook ? 'react_hook' : (isComponent ? 'react_component' : (isAsync ? 'async_arrow_fn' : 'arrow_fn')),
          startLine: i + 1,
          endLine,
          signature: `(${params}) => ${returnType}`,
          summary: comment || (isHook ? `React Custom Hook L${i + 1}-L${endLine}` : `Arrow Function L${i + 1}-L${endLine}`)
        });
        continue;
      }

      // 4. ตรวจจับ Class Method (รองรับ static, async, private #method, constructor)
      const methodMatch = line.match(/^\s{2,8}(?:(public|private|protected)\s+)?(static\s+)?(async\s+)?(#?[A-Za-z0-9_]+)\s*\(([^)]*)\)\s*(?::\s*([^{]+))?\s*\{/);
      if (methodMatch) {
        const isStatic = Boolean(methodMatch[2]);
        const isAsync = Boolean(methodMatch[3]);
        const methodName = methodMatch[4];
        const reservedKeywords = new Set(['if', 'for', 'while', 'switch', 'catch', 'function']);
        if (!reservedKeywords.has(methodName)) {
          const endLine = findBraceBlockEndLine(lines, i);
          const params = methodMatch[5].trim();
          const returnType = methodMatch[6] ? methodMatch[6].trim() : (isAsync ? 'Promise<any>' : 'any');
          const isPrivate = methodName.startsWith('#') || methodMatch[1] === 'private';
          const prefix = [
            isStatic ? 'static' : '',
            isPrivate ? 'private' : 'public',
            isAsync ? 'async' : '',
            methodName === 'constructor' ? 'constructor' : 'method'
          ].filter(Boolean).join(' ');
          const qualifiedName = currentClassName ? `${currentClassName}.${methodName}` : methodName;
          const comment = extractPrecedingComment(lines, i);
          symbols.push({
            name: qualifiedName,
            kind: prefix,
            startLine: i + 1,
            endLine,
            signature: `(${params}) => ${returnType}`,
            summary: comment || `${prefix} L${i + 1}-L${endLine} (${endLine - i} lines)`
          });
        }
      }
    }
  }

  return {
    filePath: relativePath,
    layer,
    fileHash,
    totalLines: lines.length,
    importsCount: imports.length,
    importsPreview: imports.slice(0, 8),
    exports: exportsList,
    symbols
  };
}

/**
 * สร้างไฟล์ JSON Index และ Markdown Table สำหรับให้ AI Subagents ใช้งาน
 */
function buildCodebaseMap() {
  if (!fs.existsSync(MAP_DIR)) {
    fs.mkdirSync(MAP_DIR, { recursive: true });
  }

  const allFiles = walkDirectory(WORKSPACE_ROOT).sort((a, b) => a.localeCompare(b));
  const analyzedFiles = allFiles.map(analyzeSourceFile);

  const totalSymbols = analyzedFiles.reduce((acc, f) => acc + f.symbols.length, 0);

  const indexPayload = {
    generatedAt: new Date().toISOString(),
    totalFilesScanned: analyzedFiles.length,
    totalSymbolsIndexed: totalSymbols,
    files: analyzedFiles
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(indexPayload, null, 2), 'utf8');

  let mdContent = `# สารบัญไฟล์และฟังก์ชันของโปรเจกต์ (VS Code Automated File & Function Index)\n\n`;
  mdContent += `- **อัปเดตล่าสุด (Last Indexed):** \`${indexPayload.generatedAt}\`\n`;
  mdContent += `- **จำนวนไฟล์ที่สแกนทั้งหมด (Total Files):** \`${indexPayload.totalFilesScanned}\` | **จำนวนฟังก์ชัน/สัญลักษณ์ทั้งหมด (Total Symbols):** \`${totalSymbols}\`\n`;
  mdContent += `- **กฎการใช้งานสำหรับ AI (Token-Saving Rule):** ห้ามอ่านไฟล์ทั้งหมด ให้ดูช่วงบรรทัด \`L_start - L_end\` ในตารางด้านล่าง แล้วดึงเฉพาะช่วงบรรทัดที่ต้องการใช้งานเท่านั้น\n\n---\n\n`;

  for (const file of analyzedFiles) {
    mdContent += `## File: \`${file.filePath}\`\n`;
    mdContent += `- **Layer:** ${file.layer}\n`;
    mdContent += `- **Hash:** \`${file.fileHash}\` | **Total Lines:** \`${file.totalLines}\` | **Imports:** \`${file.importsCount}\` | **Exports:** \`${file.exports.join(', ') || 'None'}\`\n\n`;

    if (file.symbols.length === 0) {
      mdContent += `> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*\n\n`;
    } else {
      mdContent += `| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |\n`;
      mdContent += `| :--- | :--- | :--- | :--- | :--- |\n`;
      for (const sym of file.symbols) {
        const cleanSig = sym.signature.replace(/\|/g, '\\|');
        const cleanSum = sym.summary.replace(/\|/g, '\\|');
        mdContent += `| \`${sym.name}\` | \`${sym.kind}\` | **L${sym.startLine} - L${sym.endLine}** | \`${cleanSig}\` | ${cleanSum} |\n`;
      }
      mdContent += `\n`;
    }
    mdContent += `---\n\n`;
  }

  fs.writeFileSync(OUTPUT_MD, mdContent, 'utf8');
  console.log(`[AI Code Mapper] Indexed ${analyzedFiles.length} files (${totalSymbols} symbols) -> ${OUTPUT_MD} & ${OUTPUT_JSON}`);
}

buildCodebaseMap();

