const forge = require("node-forge");
const pki = forge.pki;
const net = require("net");

class CertFactory {
  /**
   * Creates a Root Certificate Authority
   * @param {Object} options - CA options (organization, country, etc.)
   * @returns {Object} { key, cert } - Private key and Certificate object
   */
  static createCA(options = {}) {
    const keys = pki.rsa.generateKeyPair(2048);
    const cert = pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = "01";
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(
      cert.validity.notBefore.getFullYear() + 10
    ); // 10 years for CA

    const attrs = [
      {
        name: "commonName",
        value: options.commonName || "LocalSSL Development CA",
      },
      { name: "countryName", value: options.countryName || "TR" },
      { shortName: "ST", value: options.state || "Istanbul" },
      { name: "localityName", value: options.locality || "Istanbul" },
      { name: "organizationName", value: options.organization || "LocalSSL" },
      { shortName: "OU", value: "Development" },
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.setExtensions([
      { name: "basicConstraints", cA: true, critical: true },
      { name: "keyUsage", keyCertSign: true, cRLSign: true, critical: true },
      { name: "subjectKeyIdentifier" },
    ]);

    // Self-sign
    cert.sign(keys.privateKey, forge.md.sha256.create());

    return {
      key: keys.privateKey,
      cert: cert,
      pem: {
        key: pki.privateKeyToPem(keys.privateKey),
        cert: pki.certificateToPem(cert),
      },
    };
  }

  /**
   * Creates a Domain Certificate signed by the CA
   * @param {Object} ca - The CA object { key, cert }
   * @param {Array} domains - List of domains (e.g., ['localhost', '127.0.0.1'])
   * @param {number} validityDays - Certificate validity in days (default: 365)
   * @returns {Object} { key, cert } - Private key and Certificate object
   */
  static createCert(ca, domains, validityDays = 365) {
    const keys = pki.rsa.generateKeyPair(2048);
    const cert = pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = Date.now().toString(); // Unique serial
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setDate(
      cert.validity.notBefore.getDate() + validityDays
    );

    const attrs = [
      { name: "commonName", value: domains[0] },
      { name: "organizationName", value: "LocalSSL Development" },
      { shortName: "OU", value: "Local Certificate" },
    ];

    cert.setSubject(attrs);
    cert.setIssuer(ca.cert.subject.attributes);

    const extensions = [
      { name: "basicConstraints", cA: false },
      {
        name: "keyUsage",
        digitalSignature: true,
        keyEncipherment: true,
        dataEncipherment: true,
      },
      { name: "extKeyUsage", serverAuth: true, clientAuth: true },
      {
        name: "subjectAltName",
        altNames: domains.map((d) => {
          // Check if IP (v4 or v6)
          if (net.isIP(d)) {
            return { type: 7, ip: d };
          }
          return { type: 2, value: d };
        }),
      },
    ];

    cert.setExtensions(extensions);

    // Sign with CA
    cert.sign(ca.key, forge.md.sha256.create());

    return {
      key: keys.privateKey,
      cert: cert,
      pem: {
        key: pki.privateKeyToPem(keys.privateKey),
        cert: pki.certificateToPem(cert),
      },
    };
  }
}

module.exports = CertFactory;
