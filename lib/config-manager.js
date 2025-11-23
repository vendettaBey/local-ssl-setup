const fs = require('fs');
const path = require('path');

class ConfigManager {
  static getConfig() {
    const configPath = path.join(process.cwd(), 'localssl.config.js');
    const pkgPath = path.join(process.cwd(), 'package.json');
    
    let config = {};

    // Check localssl.config.js
    if (fs.existsSync(configPath)) {
      try {
        config = require(configPath);
      } catch (e) {
        console.warn('Failed to load localssl.config.js');
      }
    } 
    // Check package.json
    else if (fs.existsSync(pkgPath)) {
      try {
        const pkg = require(pkgPath);
        if (pkg.localssl) {
          config = pkg.localssl;
        }
      } catch (e) {
        console.warn('Failed to load package.json config');
      }
    }

    return config;
  }
}

module.exports = ConfigManager;
