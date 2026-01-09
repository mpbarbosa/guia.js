#!/usr/bin/env node
/**
 * JSDoc Audit Script
 * Checks all public APIs for JSDoc documentation compliance
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const results = {
  totalFiles: 0,
  totalExports: 0,
  documented: 0,
  undocumented: 0,
  files: []
};

function findJsFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        findJsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function checkJSDoc(content, exportMatch, lineNum) {
  // Look backwards from export line for JSDoc comment
  const lines = content.split('\n').slice(0, lineNum);
  let foundJSDoc = false;
  let jsdocStart = -1;
  
  // Search backwards for /** ... */
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 20); i--) {
    if (lines[i].trim().includes('*/')) {
      jsdocStart = i;
    }
    if (lines[i].trim().startsWith('/**')) {
      foundJSDoc = true;
      break;
    }
    // Stop if we hit another export or class
    if (lines[i].match(/^(export|class|function)/)) {
      break;
    }
  }
  
  return {
    hasJSDoc: foundJSDoc,
    jsdocStart: jsdocStart
  };
}

function auditFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const fileResult = {
    path: filePath.replace(/^.*\/guia_turistico\//, ''),
    exports: [],
    score: 0
  };
  
  // Find all exports
  lines.forEach((line, index) => {
    const exportMatch = line.match(/^export\s+(default\s+)?(class|function|const|let|{)/);
    if (exportMatch) {
      const jsdocCheck = checkJSDoc(content, exportMatch, index);
      const exportName = line.match(/(?:class|function)\s+(\w+)|const\s+(\w+)|let\s+(\w+)/);
      const name = exportName ? (exportName[1] || exportName[2] || exportName[3]) : 'unnamed';
      
      fileResult.exports.push({
        line: index + 1,
        name: name,
        type: exportMatch[2],
        hasJSDoc: jsdocCheck.hasJSDoc
      });
      
      results.totalExports++;
      if (jsdocCheck.hasJSDoc) {
        results.documented++;
      } else {
        results.undocumented++;
      }
    }
  });
  
  if (fileResult.exports.length > 0) {
    fileResult.score = ((fileResult.exports.filter(e => e.hasJSDoc).length / fileResult.exports.length) * 100).toFixed(1);
    results.files.push(fileResult);
  }
}

// Main execution
const srcDir = './src';
const files = findJsFiles(srcDir);
results.totalFiles = files.length;

files.forEach(auditFile);

// Sort by score (worst first)
results.files.sort((a, b) => parseFloat(a.score) - parseFloat(b.score));

// Output results
console.log('# JSDoc Documentation Audit Report\n');
console.log(`**Generated**: ${new Date().toISOString()}\n`);
console.log('## Summary\n');
console.log(`- **Total Files Scanned**: ${results.totalFiles}`);
console.log(`- **Files with Exports**: ${results.files.length}`);
console.log(`- **Total Exports**: ${results.totalExports}`);
console.log(`- **Documented**: ${results.documented} (${((results.documented/results.totalExports)*100).toFixed(1)}%)`);
console.log(`- **Undocumented**: ${results.undocumented} (${((results.undocumented/results.totalExports)*100).toFixed(1)}%)\n`);

console.log('## Files Needing Attention (Worst First)\n');
results.files.filter(f => parseFloat(f.score) < 100).forEach(file => {
  console.log(`### ${file.path} (${file.score}% documented)\n`);
  file.exports.forEach(exp => {
    const status = exp.hasJSDoc ? '✅' : '❌';
    console.log(`- Line ${exp.line}: ${status} \`${exp.type} ${exp.name}\``);
  });
  console.log('');
});

console.log('## Well-Documented Files\n');
results.files.filter(f => parseFloat(f.score) === 100).forEach(file => {
  console.log(`- ✅ ${file.path} (${file.exports.length} exports)`);
});

process.exit(results.undocumented > 0 ? 1 : 0);
