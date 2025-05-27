const fs = require('fs');
const path = require('path');

const fileUtils = {
  exists: (filePath) => fs.existsSync(filePath),
  
  readJson: (filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  },
  
  writeJson: (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  },
  
  readFile: (filePath) => {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      return null;
    }
  },
  
  writeFile: (filePath, content) => {
    fs.writeFileSync(filePath, content);
  },
  
  appendFile: (filePath, content) => {
    fs.appendFileSync(filePath, content);
  },
  
  createDirectory: (dirPath) => {
    fs.mkdirSync(dirPath, { recursive: true });
  },
  
  removeDirectory: (dirPath) => {
    fs.rmSync(dirPath, { recursive: true, force: true });
  },
  
  joinPaths: (...paths) => path.join(...paths)
};

module.exports = fileUtils; 