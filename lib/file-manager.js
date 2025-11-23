const fs = require('fs');
const path = require('path');
const os = require('os');

class FileManager {
  constructor() {
    this.homeDir = os.homedir();
    this.configDir = path.join(this.homeDir, '.localssl');
    this.caDir = path.join(this.configDir, 'ca');
    this.certsDir = path.join(process.cwd(), 'certificates'); // Default output dir
    
    this.ensureDirs();
  }

  ensureDirs() {
    if (!fs.existsSync(this.configDir)) fs.mkdirSync(this.configDir);
    if (!fs.existsSync(this.caDir)) fs.mkdirSync(this.caDir);
  }

  getCAPath() {
    return {
      key: path.join(this.caDir, 'rootCA.key'),
      cert: path.join(this.caDir, 'rootCA.pem')
    };
  }

  saveCA(caObj) {
    const paths = this.getCAPath();
    fs.writeFileSync(paths.key, caObj.pem.key);
    fs.writeFileSync(paths.cert, caObj.pem.cert);
    return paths;
  }

  loadCA() {
    const paths = this.getCAPath();
    if (fs.existsSync(paths.key) && fs.existsSync(paths.cert)) {
      return {
        keyPem: fs.readFileSync(paths.key, 'utf8'),
        certPem: fs.readFileSync(paths.cert, 'utf8'),
        paths
      };
    }
    return null;
  }

  saveCert(certObj, domains, outputDir = null) {
    const targetDir = outputDir ? path.resolve(outputDir) : this.certsDir;
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const baseName = domains[0].replace(/\*/g, '_');
    const keyPath = path.join(targetDir, `${baseName}.key`);
    const certPath = path.join(targetDir, `${baseName}.pem`);

    fs.writeFileSync(keyPath, certObj.pem.key);
    fs.writeFileSync(certPath, certObj.pem.cert);

    return { keyPath, certPath };
  }
}

module.exports = FileManager;
