import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const WORKSPACE_ROOT = process.cwd();
const MAP_DIR = path.join(WORKSPACE_ROOT, '.ai_map');
const OUTPUT_JSON = path.join(MAP_DIR, 'CODE_INDEX.json');
const OUTPUT_MD = path.join(MAP_DIR, '01_FILE_FUNCTION_INDEX.md');

const TARGET_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.py']);
const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 'out', 'coverage',
  '.vscode', '.ai_map', 'second_brain_vault', 'ai_skills_registry', '__pycache__', '.venv'
]);

/**
 * คำนวณ SHA-256 Hash ของเนื้อหาไฟล์เพื่อตรวจสอบว่าไฟล์มีการเปลี่ยนแปลงหรือไม่
 */
function computeFileHash(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex').slice(0, 16);
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
 * หาบรรทัดสิ้นสุดของบล็อกโค้ดแบบวงเล็บปีกกา { ... } สำหรับ JS/TS/React
 */
function findBraceBlockEndLine(lines, startLineIndex) {
  let braceDepth = 0;
  let foundOpeningBrace = false;

  for (let i = startLineIndex; i < lines.length; i++) {
    const line = lines[i];
    // ลบ String และ Comment เบื้องต้นเพื่อไม่ให้นับปีกกาผิดพลาด
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
 * สกัด Imports, Exports, Classes, Functions, React Components และ API Routes จากไฟล์
 */
function analyzeSourceFile(filePath) {
  const relativePath = path.relative(WORKSPACE_ROOT, filePath).replace(/\\/g, '/');
  const ext = path.extname(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const fileHash = computeFileHash(content);

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
  } else {
    // สำหรับไฟล์ .ts, .tsx, .js, .jsx, .mjs (Web / Web App)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

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
        symbols.push({
          name: classMatch[1],
          kind: 'class',
          startLine: i + 1,
          endLine,
          signature: trimmed.replace(/\{.*$/, '').trim(),
          summary: `Class Definition (${endLine - i} lines)`
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
        symbols.push({
          name,
          kind: isReactComponent ? 'react_component' : (isAsync ? 'async_function' : 'function'),
          startLine: i + 1,
          endLine,
          signature: `(${params}) => ${returnType}`,
          summary: isReactComponent ? `React UI Component L${i + 1}-L${endLine}` : `Function L${i + 1}-L${endLine}`
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
        symbols.push({
          name,
          kind: isHook ? 'react_hook' : (isComponent ? 'react_component' : (isAsync ? 'async_arrow_fn' : 'arrow_fn')),
          startLine: i + 1,
          endLine,
          signature: `(${params}) => ${returnType}`,
          summary: isHook ? `React Custom Hook L${i + 1}-L${endLine}` : `Arrow Function L${i + 1}-L${endLine}`
        });
        continue;
      }

      // 4. ตรวจจับ Class Method (ใน Controller / Service / Repository)
      const methodMatch = line.match(/^\s+(?:public\s+|private\s+|protected\s+|static\s+)?(async\s+)?([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*(?::\s*([^{]+))?\s*\{/);
      if (methodMatch) {
        const methodName = methodMatch[2];
        const reservedKeywords = new Set(['if', 'for', 'while', 'switch', 'catch', 'constructor']);
        if (!reservedKeywords.has(methodName)) {
          const endLine = findBraceBlockEndLine(lines, i);
          const isAsync = Boolean(methodMatch[1]);
          const params = methodMatch[3].trim();
          const returnType = methodMatch[4] ? methodMatch[4].trim() : 'inferred';
          symbols.push({
            name: methodName,
            kind: isAsync ? 'async_method' : 'method',
            startLine: i + 1,
            endLine,
            signature: `(${params}) => ${returnType}`,
            summary: `Class Method L${i + 1}-L${endLine}`
          });
        }
      }
    }
  }

  return {
    filePath: relativePath,
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

  const allFiles = walkDirectory(WORKSPACE_ROOT);
  const analyzedFiles = allFiles.map(analyzeSourceFile);

  const indexPayload = {
    generatedAt: new Date().toISOString(),
    totalFilesScanned: analyzedFiles.length,
    files: analyzedFiles
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(indexPayload, null, 2), 'utf8');

  let mdContent = `# สารบัญไฟล์และฟังก์ชันของโปรเจกต์ (VS Code Automated File & Function Index)\n\n`;
  mdContent += `- **อัปเดตล่าสุด (Last Indexed):** \`${indexPayload.generatedAt}\`\n`;
  mdContent += `- **จำนวนไฟล์ที่สแกนทั้งหมด (Total Files):** \`${indexPayload.totalFilesScanned}\`\n`;
  mdContent += `- **กฎการใช้งานสำหรับ AI (Token-Saving Rule):** ห้ามอ่านไฟล์ทั้งหมด ให้ดูช่วงบรรทัด \`L_start - L_end\` ในตารางด้านล่าง แล้วดึงเฉพาะช่วงบรรทัดที่ต้องการใช้งานเท่านั้น\n\n---\n\n`;

  for (const file of analyzedFiles) {
    mdContent += `## File: \`${file.filePath}\`\n`;
    mdContent += `- **Hash:** \`${file.fileHash}\` | **Total Lines:** \`${file.totalLines}\` | **Exports:** \`${file.exports.join(', ') || 'None'}\`\n\n`;

    if (file.symbols.length === 0) {
      mdContent += `> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*\n\n`;
    } else {
      mdContent += `| ชื่อฟังก์ชัน / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | รายละเอียด (Summary) |\n`;
      mdContent += `| :--- | :--- | :--- | :--- | :--- |\n`;
      for (const sym of file.symbols) {
        const cleanSig = sym.signature.replace(/\|/g, '\\|');
        mdContent += `| \`${sym.name}\` | \`${sym.kind}\` | **L${sym.startLine} - L${sym.endLine}** | \`${cleanSig}\` | ${sym.summary} |\n`;
      }
      mdContent += `\n`;
    }
    mdContent += `---\n\n`;
  }

  fs.writeFileSync(OUTPUT_MD, mdContent, 'utf8');
  console.log(`[AI Code Mapper] Indexed ${analyzedFiles.length} files -> ${OUTPUT_MD} & ${OUTPUT_JSON}`);
}

buildCodebaseMap();
