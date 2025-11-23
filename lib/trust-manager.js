const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const chalk = require("chalk");

class TrustManager {
  static async installCA(caPath) {
    const platform = process.platform;

    try {
      if (platform === "win32") {
        await this.installOnWindows(caPath);
      } else if (platform === "darwin") {
        await this.installOnMac(caPath);
      } else if (platform === "linux") {
        await this.installOnLinux(caPath);
      } else {
        throw new Error(
          `Platform ${platform} is not supported for automatic CA installation.`
        );
      }
      console.log(chalk.green("✓ CA Certificate installed successfully."));
    } catch (error) {
      console.error(
        chalk.red("✗ Failed to install CA Certificate:"),
        error.message
      );
      console.log(
        chalk.yellow("⚠ You may need to install the CA certificate manually.")
      );
      throw error;
    }
  }

  static async uninstallCA() {
    const platform = process.platform;
    const caName = "LocalSSL Development CA";

    try {
      if (platform === "win32") {
        await this.uninstallOnWindows(caName);
      } else if (platform === "darwin") {
        await this.uninstallOnMac(caName);
      } else if (platform === "linux") {
        await this.uninstallOnLinux();
      } else {
        throw new Error(
          `Platform ${platform} is not supported for automatic CA uninstallation.`
        );
      }
      console.log(chalk.green("✓ CA Certificate uninstalled successfully."));
    } catch (error) {
      console.error(
        chalk.red("✗ Failed to uninstall CA Certificate:"),
        error.message
      );
      throw error;
    }
  }

  static async installOnWindows(caPath) {
    console.log(
      chalk.blue("ℹ Installing CA on Windows... (Admin privileges required)")
    );
    try {
      execSync(`certutil -addstore -f "Root" "${caPath}"`, { stdio: "pipe" });
    } catch (err) {
      throw new Error(
        "Failed to run certutil. Please run the terminal as Administrator."
      );
    }
  }

  static async uninstallOnWindows(caName) {
    console.log(
      chalk.blue("ℹ Uninstalling CA on Windows... (Admin privileges required)")
    );
    try {
      execSync(`certutil -delstore "Root" "${caName}"`, { stdio: "pipe" });
    } catch (err) {
      throw new Error(
        "Failed to run certutil. Please run the terminal as Administrator."
      );
    }
  }

  static async installOnMac(caPath) {
    console.log(
      chalk.blue("ℹ Installing CA on macOS... (Sudo password may be required)")
    );
    execSync(
      `sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "${caPath}"`
    );
  }

  static async uninstallOnMac(caName) {
    console.log(
      chalk.blue(
        "ℹ Uninstalling CA on macOS... (Sudo password may be required)"
      )
    );
    try {
      execSync(
        `sudo security delete-certificate -c "${caName}" /Library/Keychains/System.keychain`
      );
    } catch (error) {
      // Ignore if not found
    }
  }

  static async installOnLinux(caPath) {
    console.log(
      chalk.blue("ℹ Installing CA on Linux... (Sudo password may be required)")
    );

    // Debian/Ubuntu/Alpine
    if (fs.existsSync("/usr/local/share/ca-certificates")) {
      const dest = `/usr/local/share/ca-certificates/localssl-ca.crt`;
      execSync(`sudo cp "${caPath}" "${dest}"`);
      execSync(`sudo update-ca-certificates`);
    }
    // Fedora/RHEL/CentOS
    else if (fs.existsSync("/etc/pki/ca-trust/source/anchors")) {
      const dest = `/etc/pki/ca-trust/source/anchors/localssl-ca.crt`;
      execSync(`sudo cp "${caPath}" "${dest}"`);
      execSync(`sudo update-ca-trust extract`);
    } else {
      throw new Error(
        "Unsupported Linux distribution (cannot find CA store path)."
      );
    }
  }

  static async uninstallOnLinux() {
    console.log(
      chalk.blue(
        "ℹ Uninstalling CA on Linux... (Sudo password may be required)"
      )
    );

    // Debian/Ubuntu/Alpine
    if (fs.existsSync("/usr/local/share/ca-certificates/localssl-ca.crt")) {
      execSync(`sudo rm -f /usr/local/share/ca-certificates/localssl-ca.crt`);
      execSync(`sudo update-ca-certificates --fresh`);
    }
    // Fedora/RHEL/CentOS
    if (fs.existsSync("/etc/pki/ca-trust/source/anchors/localssl-ca.crt")) {
      execSync(`sudo rm -f /etc/pki/ca-trust/source/anchors/localssl-ca.crt`);
      execSync(`sudo update-ca-trust extract`);
    }
  }
}

module.exports = TrustManager;
