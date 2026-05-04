const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['packages/api/modules', 'apps/api-server/src'];
const MAX_FUNCTION_LINES = 50;

function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let results = [];

  // 1. Simple God Function Check (Line Count)
  let currentFunction = null;
  let startLine = 0;
  let bracketCount = 0;

  lines.forEach((line, index) => {
    // Detect function start
    const funcMatch = line.match(/(async\s+)?function\s+(\w+)|(\w+)\s*[:=]\s*(async\s+)?\(/);
    if (funcMatch && bracketCount === 0) {
      currentFunction = funcMatch[2] || funcMatch[3];
      startLine = index + 1;
    }

    if (line.includes('{')) bracketCount += (line.match(/{/g) || []).length;
    if (line.includes('}')) bracketCount -= (line.match(/}/g) || []).length;

    if (currentFunction && bracketCount === 0) {
      const length = index + 1 - startLine;
      if (length > MAX_FUNCTION_LINES) {
        results.push({
          type: 'GOD_FUNCTION',
          name: currentFunction,
          lines: length,
          line: startLine
        });
      }
      currentFunction = null;
    }

    // 2. N+1 Pattern Check (Await in Loop)
    // This is a naive regex but good for finding likely candidates
    if (line.match(/for\s*\(.*await\s+/) || line.match(/map\(.*async.*await\s+/)) {
      results.push({
        type: 'POSSIBLE_N_PLUS_1',
        line: index + 1,
        snippet: line.trim()
      });
    }
  });

  return results;
}

function walk(dir) {
  let files = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      files = files.concat(walk(fullPath));
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      files.push(fullPath);
    }
  });
  return files;
}

console.log('--- Codebase Efficiency Audit ---');
const rootDir = process.cwd();
DIRECTORIES.forEach(dir => {
  const absoluteDir = path.join(rootDir, dir);
  if (!fs.existsSync(absoluteDir)) return;
  
  const files = walk(absoluteDir);
  files.forEach(file => {
    const fileResults = auditFile(file);
    if (fileResults.length > 0) {
      console.log(`\nFile: ${path.relative(rootDir, file)}`);
      fileResults.forEach(r => {
        console.log(`  [${r.type}] ${r.name || ''} at line ${r.line} (${r.lines || ''} lines) ${r.snippet || ''}`);
      });
    }
  });
});
