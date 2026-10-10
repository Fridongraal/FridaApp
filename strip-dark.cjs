const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replaceClasses = (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Remove dark:something classes
  content = content.replace(/dark:[^\s"'}]+/g, '');
  
  // Clean up multiple spaces that might have been left
  content = content.replace(/\s{2,}/g, ' ');
  content = content.replace(/ \}/g, '}');
  content = content.replace(/ "/g, '"');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
};

walkDir(path.join(__dirname, 'src'), replaceClasses);
console.log('Done.');
