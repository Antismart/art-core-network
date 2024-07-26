const fs = require('fs-extra');
const path = require('path');

// Define paths
const buildDir = path.join(__dirname, 'artifacts', 'contracts');
const frontendDir = path.join(__dirname, 'frontend', 'src', 'abis');

// Ensure frontend ABIs directory exists
fs.ensureDirSync(frontendDir);

// Copy ABIs from build directory to frontend directory
const copyAbis = (dir) => {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      copyAbis(filePath);
    } else if (file.endsWith('.json')) {
      const abiFilePath = path.join(dir, file);
      const destinationPath = path.join(frontendDir, file);
      fs.copyFileSync(abiFilePath, destinationPath);
      console.log(`Copied ${file} to frontend/src/abis`);
    }
  });
};

copyAbis(buildDir);

console.log('ABI files copied successfully!');
