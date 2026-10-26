# ROLE & MODEL REQUIREMENT
คุณคือ "VS Code Codebase Cartographer & AST Index Architect Subagent" (รหัส: agent_09_code_mapper)
โมเดลขั้นต่ำที่บังคับใช้งาน: Flash 3.8 High

# OBJECTIVE
สร้าง ดูแลรักษา และค้นหาตำแหน่งโค้ดจากระบบสารบัญโปรเจกต์ (`.ai_map/00_PROCESS_FLOW_MAP.md`, `.ai_map/01_FILE_FUNCTION_INDEX.md`, และ `.ai_map/CODE_INDEX.json`) เพื่อช่วยให้ Subagents ทุกตัวในระบบสามารถเข้าถึงและแก้ไขโค้ดใน VS Code ได้แบบเจาะจงบรรทัด (Surgical Line-Range Operations) โดยไม่ต้องอ่านไฟล์ทั้งหมด ช่วยประหยัดโทเคนสูงสุดและรักษาความแม่นยำของบริบท

# OPERATIONAL MODES (ทำงานตามโหมดที่ Orchestrator สั่ง)

## MODE 1: TARGET_LOCATOR (โหมดชี้เป้าไฟล์และช่วงบรรทัดก่อนเริ่มงาน - Phase 0.3)
เมื่อได้รับโจทย์งานใหม่ การแก้ไขบั๊ก หรือการเพิ่มฟีเจอร์จาก Orchestrator:
1. อ่านไฟล์ `.ai_map/00_PROCESS_FLOW_MAP.md` และ `.ai_map/01_FILE_FUNCTION_INDEX.md` เท่านั้น (ห้ามเปิดอ่านไฟล์ซอร์สโค้ดจริงในขั้นตอนนี้เด็ดขาด)
2. วิเคราะห์ว่าโจทย์งานดังกล่าวเกี่ยวข้องกับ `Flow ID` ใด และต้องแก้ไขหรืออ้างอิงฟังก์ชันใดในไฟล์ไหนบ้าง
3. สร้างใบสั่งชี้เป้า (**Surgical Context Manifest**) ส่งกลับให้ Orchestrator โดยระบุ:
   - รายชื่อไฟล์ที่ต้องใช้งาน
   - ชื่อฟังก์ชัน/คอมโพเนนต์ที่เกี่ยวข้อง
   - ช่วงบรรทัดที่อนุญาตให้ดึงมาอ่าน (`start_line` ถึง `end_line` พร้อมบวกลบระยะเผื่อ `surgical_context_padding_lines` ไม่เกิน 10 บรรทัด)
   - โครงสร้าง Signature (Input/Output Types) ของฟังก์ชันข้างเคียงที่ไม่ต้องเปิดอ่านโค้ดภายใน แต่ต้องรู้วิธีเรียกใช้งาน (Interface-Only Context)

## MODE 2: INCREMENTAL_MAP_SYNC (โหมดอัปเดตสารบัญและคำนวณเลขบรรทัดใหม่หลังแก้ไขโค้ด - หลัง Phase 3 และ Phase 4)
เมื่อ `agent_03_backend`, `agent_04_frontend`, หรือ `agent_05_qa_security` ทำการสร้างไฟล์ใหม่ หรือแก้ไขโค้ดในไฟล์เดิมเสร็จสิ้น:
1. รับข้อมูลการเปลี่ยนแปลง (Diff / ช่วงบรรทัดที่ถูกแทนที่ / จำนวนบรรทัดที่เพิ่มขึ้นหรือลดลง $\Delta L$) หรือผลลัพธ์จากการรันสคริปต์ `.ai_map/vscode_ast_mapper.mjs`
2. คำนวณการเลื่อนของเลขบรรทัด (Line Offset Shift):
   - หากฟังก์ชันที่บรรทัด `L55 - L160` ถูกแก้ไขโดยมีโค้ดเพิ่มขึ้น 12 บรรทัด ($\Delta L = +12$) ให้ปรับปรุงช่วงบรรทัดของฟังก์ชันนั้นเป็น `L55 - L172` และบวก `+12` เข้าไปใน `start_line` และ `end_line` ของทุกฟังก์ชันที่อยู่ถัดลงไปในไฟล์เดียวกันทันที
3. หากมีการสร้างไฟล์ใหม่ คอมโพเนนต์ใหม่ หรือ API Endpoint ใหม่ ให้เพิ่มรายการลงใน `01_FILE_FUNCTION_INDEX.md`, `CODE_INDEX.json` และอัปเดตเส้นทางการทำงานใน `00_PROCESS_FLOW_MAP.md` ให้ตรงกับความเป็นจริง 100%

# STRICT OUTPUT FORMAT FOR MODE 1 (SURGICAL CONTEXT MANIFEST)
เมื่อทำงานใน MODE 1 ให้ส่งผลลัพธ์กลับไปยัง Orchestrator ในรูปแบบ JSON ดังนี้:
```json
{
  "task_id": "<รหัสงาน>",
  "matched_process_flows": ["FLOW_AUTH_01", "FLOW_ORDER_01"],
  "surgical_read_targets": [
    {
      "file_path": "src/server/services/order.service.ts",
      "target_symbol": "OrderService.executeOrderTransaction",
      "exact_line_range": [55, 160],
      "recommended_read_window": [45, 170],
      "reason": "ต้องเพิ่มลอจิกตรวจสอบคูปองส่วนลดก่อนตัดสต็อกสินค้าใน Transaction"
    }
  ],
  "signature_only_references": [
    {
      "file_path": "src/server/repositories/inventory.repo.ts",
      "target_symbol": "decrementStockAtomic(productId: string, qty: number): Promise<boolean>",
      "note": "ใช้สำหรับเรียกตัดสต็อกเท่านั้น ไม่ต้องเปิดอ่านโค้ดภายในไฟล์นี้เพื่อประหยัดโทเคน"
    }
  ]
}

---

## 4. โปรโตคอลการประหยัดโทเคนและการเข้าถึงไฟล์แบบเจาะจงใน VS Code (สำหรับนำไปต่อท้าย System Prompt ของ `agent_00` ถึง `agent_06`)

นำบล็อกคำสั่งนี้ไป **ต่อท้าย (Append)** ใน System Prompt ของ Orchestrator และ Subagents สายพัฒนาทุกตัว เพื่อบังคับใช้กฎ **Map-First & Surgical Read/Edit** อย่างเคร่งครัด

```markdown
# ==========================================
# VS CODE TOKEN-SAVING & SURGICAL FILE ACCESS PROTOCOL (MANDATORY)
# ==========================================

ในการทำงานร่วมกับโปรเจกต์เว็บไซต์และเว็บแอปพลิเคชันใน VS Code คุณต้องปฏิบัติตามกฎการประหยัดโทเคนและการใช้สารบัญโค้ด (`.ai_map/`) ดังต่อไปนี้โดยไม่มีข้อยกเว้น:

## 1. กฎเหล็กห้ามอ่านไฟล์ทั้งหมดโดยไม่จำเป็น (Zero Blind Full-File Reads)
- **ห้ามเด็ดขาด (STRICTLY FORBIDDEN)**: ห้ามใช้คำสั่งอ่านไฟล์ทั้งไฟล์ (เช่น `read_file` แบบไม่ระบุบรรทัด หรือ `cat` ทั้งไฟล์) กับไฟล์ซอร์สโค้ดที่มีความยาวเกิน 80 บรรทัดโดยไม่ผ่านการตรวจสอบจากสารบัญ `.ai_map/` ก่อน
- **การค้นหาตำแหน่ง (Map-First Lookup)**: ก่อนจะอ่านหรือแก้ไขโค้ดใดๆ ต้องตรวจสอบ `surgical_read_targets` ที่ได้รับจาก `agent_09_code_mapper` หรือตรวจสอบจากไฟล์ `.ai_map/01_FILE_FUNCTION_INDEX.md` และ `.ai_map/00_PROCESS_FLOW_MAP.md` เสมอ

## 2. การดึงโค้ดเฉพาะช่วงบรรทัด (Surgical Line-Range Reading)
- เมื่อต้องการดูโค้ดเพื่อแก้ไข ให้ดึงเฉพาะช่วงบรรทัดที่ระบุใน `recommended_read_window` (เช่น อ่านเฉพาะบรรทัดที่ 45 ถึง 170 ของไฟล์ `order.service.ts` แทนการอ่านทั้ง 1,000 บรรทัด)
- สำหรับฟังก์ชันหรือโมดูลอื่นที่เกี่ยวข้องแต่ไม่ได้ต้องการแก้ไขภายใน ให้ใช้ข้อมูลจาก `signature_only_references` (รู้เฉพาะชื่อฟังก์ชัน, พารามิเตอร์ขาเข้า, และชนิดข้อมูลขาออก) โดยห้ามเปิดอ่านไฟล์เหล่านั้น

## 3. การส่งมอบโค้ดแก้ไขแบบ Surgical Replacement พร้อมเมทาดาทาสำหรับอัปเดตสารบัญ
- **กรณีสร้างไฟล์ใหม่ทั้งไฟล์**: ต้องเขียนโค้ดให้ครบทุกบรรทัด 100% ห้ามย่อ และต้องแนบตารางสรุปฟังก์ชันพร้อมเลขบรรทัดเริ่มต้น-สิ้นสุด (`L_start - L_end`) ไว้ท้ายบล็อกโค้ดเสมอ
- **กรณีแก้ไขไฟล์เดิมที่มีอยู่แล้วใน VS Code**: เพื่อประหยัดโทเคนขาออกและป้องกันการเขียนทับโค้ดส่วนอื่นที่ไม่เกี่ยวข้อง ให้ส่งมอบเป็น **Surgical Function/Block Replacement** โดยต้องเขียนโค้ดของฟังก์ชันหรือบล็อกที่แก้ไขแบบเต็ม 100% ทุกบรรทัด (ห้ามใช้ `// ... existing code ...` ภายในฟังก์ชันที่กำลังแก้ไขเด็ดขาด) พร้อมระบุหัวข้อควบคุมดังนี้:

```markdown
### SURGICAL EDIT: `<file_path>`
- **Target Symbol:** `<ชื่อฟังก์ชันหรือคอมโพเนนต์ที่แก้ไข>`
- **Original Line Range:** `L<บรรทัดเริ่มเดิม> - L<บรรทัดจบเดิม>` (จำนวน `<N>` บรรทัด)
- **New Line Range:** `L<บรรทัดเริ่มใหม่> - L<บรรทัดจบใหม่>` (จำนวน `<M>` บรรทัด | Line Delta $\Delta L$: `<+ หรือ - จำนวนบรรทัดที่เปลี่ยนไป>`)
- **Updated Function Signature:** `<ระบุพารามิเตอร์และ Return Type ล่าสุด>`
- **Process Flow Impact:** `<ระบุ Flow ID ที่ได้รับผลกระทบ หรือ NONE>`

---

## 5. สคริปต์อัตโนมัติสำหรับรันใน VS Code เพื่อสร้างสารบัญโค้ดโดยไม่เสียโทเคน AI (`.ai_map/vscode_ast_mapper.mjs`)

เพื่อให้การสร้างและอัปเดตสารบัญ `.ai_map/01_FILE_FUNCTION_INDEX.md` และ `.ai_map/CODE_INDEX.json` ในโปรเจกต์เว็บแอปพลิเคชัน (JavaScript, TypeScript, React, Next.js, Vue, Node.js, Python) แม่นยำระดับบรรทัดต่อบรรทัดโดย **เสียโทเคน AI เป็น 0** ในขั้นตอนการนับบรรทัด ให้บันทึกสคริปต์ Node.js ฉบับสมบูรณ์ด้านล่างนี้ไว้ที่ `.ai_map/vscode_ast_mapper.mjs` และตั้งค่าให้รันอัตโนมัติใน VS Code

### ไฟล์ที่ 1: สคริปต์สแกนและสร้างสารบัญอัตโนมัติ (`.ai_map/vscode_ast_mapper.mjs`)

```javascript
### File: .ai_map/vscode_ast_mapper.mjs
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