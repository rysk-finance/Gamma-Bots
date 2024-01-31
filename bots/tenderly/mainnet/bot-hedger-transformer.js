const fs = require('fs');
const path = require('path');

async function modifyAndCopyToClipboard() {
  // Step 1: Read the ABI file
  const abiPath = path.join(__dirname, '../../abi/Manager.json');
  const managerAbi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

  // Step 2: Read and modify the source code
  const sourceFilePath = path.join(__dirname, 'bot-hedger.js');
  let sourceCode = fs.readFileSync(sourceFilePath, 'utf8');

  // Replace the require statement with the actual ABI data
  sourceCode = sourceCode.replace("const managerAbi = require('../../abi/Manager.json')", `const managerAbi = ${JSON.stringify(managerAbi)}`);

  // Modify module.exports to only export actionFn
  sourceCode = sourceCode.replace(/(module\.exports\s*=\s*{).*(})/, '$1 actionFn $2');

  // Step 3: Import clipboardy using dynamic import
  const clipboardyModule = await import('clipboardy');
  clipboardyModule.default.writeSync(sourceCode);

  console.log('Modified code copied to clipboard.');
}

modifyAndCopyToClipboard().catch(console.error);
