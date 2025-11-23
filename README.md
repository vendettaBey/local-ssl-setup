# LocalSSL 🔒

LocalSSL is a zero-config, native Node.js command-line tool that enables you to use HTTPS in your local development environment (localhost) without any installation.

## Features

- 🚀 **Fast:** Generates certificates with a single command.
- 📦 **No Installation:** No need to download external binaries (like mkcert).
- 🛡️ **Secure:** Creates your own Certificate Authority (CA) and trusts it on your system.
- ⚙️ **Flexible:** Use it via command-line arguments or interactive mode.
- 🌐 **IPv6 Support:** Full support for IPv6 addresses (e.g., `::1`).
- 🧹 **Cleanable:** You can remove the CA certificate from the system with a single command.

## Installation

Install globally to access it from anywhere:

```bash
npm install -g local-ssl-setup
```

Or run it instantly with `npx` without installing:

```bash
npx local-ssl-setup
```

## Usage

### 1. Interactive Mode (Recommended)

If you run it without parameters, it will ask you step-by-step questions:

```bash
local-ssl-setup
```

### 2. Quick Mode

You can specify domains and output directory directly:

```bash
local-ssl-setup -d localhost,test.local --output ./certs
```

### 3. Uninstall

To remove the CA certificate from system trusted roots:

```bash
local-ssl-setup --uninstall
```

### Options

| Option         | Alias | Description                                                   |
| -------------- | ----- | ------------------------------------------------------------- |
| `--domains`    | `-d`  | Comma separated list of domains (e.g., `localhost,api.local`) |
| `--output`     | `-o`  | Directory to save certificates                                |
| `--validity`   |       | Certificate validity in days. Default: 365                    |
| `--install-ca` |       | Attempts to add the CA certificate to system trusted roots    |
| `--uninstall`  |       | Removes the CA certificate from the system                    |
| `--help`       | `-h`  | Shows help message                                            |

## Configuration File (Optional)

You can persist your settings by creating a `localssl.config.js` file in your project root:

```javascript
// localssl.config.js
module.exports = {
  domains: ["localhost", "my-app.local"],
  output: "./ssl",
};
```

## Support

If you enjoy this theme and want to support its development, you can buy me a coffee! ☕

<a href="https://buymeacoffee.com/vendettabey" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

Your support helps me create more awesome themes and tools! 🙏
