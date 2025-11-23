const CertFactory = require('./lib/cert-factory');

try {
  console.log('Creating CA...');
  const ca = CertFactory.createCA();
  console.log('CA Created.');
  
  console.log('Creating Cert...');
  const cert = CertFactory.createCert(ca, ['localhost']);
  console.log('Cert Created.');
} catch (error) {
  console.error(error);
}
