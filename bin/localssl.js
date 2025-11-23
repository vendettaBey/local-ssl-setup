#!/usr/bin/env node

const { program } = require("commander");
const inquirer = require("inquirer");
const chalk = require("chalk");
const ora = require("ora");
const forge = require("node-forge");
const CertFactory = require("../lib/cert-factory");
const TrustManager = require("../lib/trust-manager");
const FileManager = require("../lib/file-manager");
const ConfigManager = require("../lib/config-manager");

const fileManager = new FileManager();

async function main() {
  program
    .version("1.0.0")
    .description("LocalSSL - Local development SSL certificate setup tool")
    .option("-d, --domains <domains>", "Comma separated list of domains")
    .option("-o, --output <dir>", "Output directory for certificates")
    .option("--install-ca", "Install CA to system trust store")
    .option("--uninstall", "Uninstall the CA from system trust store")
    .option("--validity <days>", "Validity of the certificate in days", "365")
    .action(async (options) => {
      // Uninstall mode
      if (options.uninstall) {
        const spinner = ora("Uninstalling Certificate Authority...").start();
        try {
          await TrustManager.uninstallCA();
          spinner.succeed("CA uninstalled successfully.");
          return;
        } catch (error) {
          spinner.fail("Failed to uninstall CA.");
          console.error(error);
          process.exit(1);
        }
      }

      let domains = options.domains ? options.domains.split(",") : [];
      let outputDir = options.output;
      let shouldInstallCA = options.installCa;
      let validityDays = parseInt(options.validity, 10);

      // Interactive mode if no args
      if (domains.length === 0) {
        const config = ConfigManager.getConfig();

        if (config.domains) {
          domains = config.domains;
          console.log(
            chalk.blue(`ℹ Loaded domains from config: ${domains.join(", ")}`)
          );
        } else {
          const answers = await inquirer.prompt([
            {
              type: "input",
              name: "domains",
              message: "Enter domains (comma separated):",
              default: "localhost,127.0.0.1",
            },
            {
              type: "input",
              name: "output",
              message: "Output directory:",
              default: "./certificates",
            },
            {
              type: "number",
              name: "validity",
              message: "Validity in days:",
              default: 365,
            },
            {
              type: "confirm",
              name: "installCA",
              message: "Do you want to install the CA to system trust store?",
              default: true,
            },
          ]);
          domains = answers.domains.split(",").map((d) => d.trim());
          outputDir = answers.output;
          shouldInstallCA = answers.installCA;
          validityDays = answers.validity || 365;
        }
      }

      const spinner = ora("Checking Certificate Authority...").start();

      try {
        // 1. Load or Create CA
        let caObj;
        const existingCA = fileManager.loadCA();

        if (existingCA) {
          spinner.text = "Loading existing CA...";
          caObj = {
            key: forge.pki.privateKeyFromPem(existingCA.keyPem),
            cert: forge.pki.certificateFromPem(existingCA.certPem),
            pem: { key: existingCA.keyPem, cert: existingCA.certPem },
          };
        } else {
          spinner.text = "Creating new CA...";
          caObj = CertFactory.createCA();
          fileManager.saveCA(caObj);
          shouldInstallCA = true; // Always install if new
        }

        // 2. Install CA if requested
        if (shouldInstallCA) {
          spinner.text = "Installing CA to system trust store...";
          spinner.stop(); // Stop spinner for sudo/admin prompt
          try {
            await TrustManager.installCA(fileManager.getCAPath().cert);
            spinner.succeed("CA installed to system trust store");
          } catch (error) {
            spinner.warn(
              chalk.yellow(
                "Could not install CA to system trust store. You may need to install it manually."
              )
            );
            console.error(chalk.dim(error.message));
          }
          spinner.start();
        }

        // 3. Generate Certs
        spinner.text = `Generating certificates for ${domains.join(", ")}...`;
        const certObj = CertFactory.createCert(caObj, domains, validityDays);

        // 4. Save Certs
        const savedPaths = fileManager.saveCert(certObj, domains, outputDir);

        spinner.succeed(chalk.green("Certificates generated successfully!"));

        console.log("\n" + chalk.bold("Files created:"));
        console.log(` ${chalk.cyan("Key:")}  ${savedPaths.keyPath}`);
        console.log(` ${chalk.cyan("Cert:")} ${savedPaths.certPath}`);

        console.log("\n" + chalk.yellow.bold("☕ Buy Me a Coffee"));
        console.log(
          chalk.gray(
            "If this tool helped you, consider supporting the development:"
          )
        );
        console.log(chalk.underline("https://www.buymeacoffee.com/omerkargin"));
      } catch (error) {
        spinner.fail(chalk.red("Operation failed"));
        console.error(error);
        process.exit(1);
      }
    });

  program.parse(process.argv);
}

main();
