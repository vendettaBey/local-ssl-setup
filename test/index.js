const assert = require("assert");
const CertFactory = require("../lib/cert-factory");
const forge = require("node-forge");

console.log("Running tests...");

try {
  // Test 1: Create CA
  console.log("Test 1: Create CA...");
  const ca = CertFactory.createCA({ commonName: "Test CA" });
  assert.ok(ca.key, "CA Private Key should exist");
  assert.ok(ca.cert, "CA Certificate should exist");
  assert.strictEqual(
    ca.cert.subject.getField("CN").value,
    "Test CA",
    "CA Common Name should match"
  );
  console.log("✓ CA creation passed");

  // Test 2: Create Cert with default validity
  console.log("Test 2: Create Certificate (Default Validity)...");
  const domains = ["localhost", "127.0.0.1"];
  const certObj = CertFactory.createCert(ca, domains);
  assert.ok(certObj.key, "Cert Private Key should exist");
  assert.ok(certObj.cert, "Cert Certificate should exist");

  // Check SANs
  const altNames = certObj.cert.getExtension("subjectAltName").altNames;
  assert.strictEqual(altNames.length, 2, "Should have 2 SANs");
  assert.strictEqual(
    altNames[0].value,
    "localhost",
    "First SAN should be localhost"
  );
  assert.strictEqual(altNames[1].ip, "127.0.0.1", "Second SAN should be IP");
  console.log("✓ Certificate creation passed");

  // Test 3: Create Cert with custom validity
  console.log("Test 3: Create Certificate (Custom Validity)...");
  const validityDays = 10;
  const certObj2 = CertFactory.createCert(ca, domains, validityDays);

  const notBefore = certObj2.cert.validity.notBefore;
  const notAfter = certObj2.cert.validity.notAfter;
  const diffTime = Math.abs(notAfter - notBefore);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Allow small difference due to execution time
  assert.ok(
    Math.abs(diffDays - validityDays) <= 1,
    `Validity should be close to ${validityDays} days`
  );
  console.log("✓ Custom validity passed");

  // Test 4: IPv6 Support
  console.log("Test 4: IPv6 Support...");
  const ipv6Domains = ["::1"];
  const certObj3 = CertFactory.createCert(ca, ipv6Domains);
  const altNamesIPv6 = certObj3.cert.getExtension("subjectAltName").altNames;

  console.log("Actual IPv6:", altNamesIPv6[0].ip);

  // Check if it contains the expanded version or the short version
  // node-forge might return it in expanded form
  const expectedExpanded = "0000:0000:0000:0000:0000:0000:0000:0001";
  const expectedShort = "::1";

  assert.ok(
    altNamesIPv6[0].ip === expectedExpanded ||
      altNamesIPv6[0].ip === expectedShort,
    `IPv6 should match either ${expectedShort} or ${expectedExpanded}. Got: ${altNamesIPv6[0].ip}`
  );
  console.log("✓ IPv6 support passed");

  console.log("\nAll tests passed successfully! 🎉");
} catch (error) {
  console.error("\n❌ Test failed:", error.message);
  process.exit(1);
}
