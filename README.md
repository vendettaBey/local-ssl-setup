# LocalSSL 🔒

LocalSSL, yerel geliştirme ortamınızda (localhost) HTTPS kullanmanızı sağlayan, kurulum gerektirmeyen (native Node.js) bir komut satırı aracıdır.

## Özellikler

- 🚀 **Hızlı:** Tek komutla sertifika oluşturur.
- 📦 **Kurulumsuz:** Harici bir binary (mkcert vb.) indirmenize gerek yoktur.
- 🛡️ **Güvenli:** Kendi Sertifika Yetkilinizi (CA) oluşturur ve sisteminize tanıtır.
- ⚙️ **Esnek:** İster komut satırı argümanlarıyla, ister interaktif modda kullanın.
- 🌐 **IPv6 Desteği:** IPv6 adresleri (örn: `::1`) için tam destek.
- 🧹 **Temizlenebilir:** İstediğiniz zaman CA sertifikasını sistemden tek komutla kaldırabilirsiniz.

## Kurulum

Aracı global olarak kurarak her yerden erişebilirsiniz:

```bash
npm install -g local-ssl-setup
```

Veya kurmadan `npx` ile anlık çalıştırabilirsiniz:

```bash
npx local-ssl-setup
```

## Kullanım

### 1. İnteraktif Mod (Önerilen)

Hiçbir parametre vermeden çalıştırırsanız, size adım adım sorular sorar:

```bash
local-ssl-setup
```

### 2. Hızlı Mod

Domainleri ve çıktı klasörünü doğrudan belirtebilirsiniz:

```bash
local-ssl-setup -d localhost,test.local --output ./certs
```

### 3. Kaldırma (Uninstall)

CA sertifikasını sistem güvenilir köklerinden kaldırmak için:

```bash
local-ssl-setup --uninstall
```

### Seçenekler

| Seçenek        | Kısayol | Açıklama                                                      |
| -------------- | ------- | ------------------------------------------------------------- |
| `--domains`    | `-d`    | Virgülle ayrılmış domain listesi (örn: `localhost,api.local`) |
| `--output`     | `-o`    | Sertifikaların kaydedileceği klasör                           |
| `--validity`   |         | Sertifika geçerlilik süresi (gün). Varsayılan: 365            |
| `--install-ca` |         | CA sertifikasını sistem güvenilir köklerine eklemeyi dener    |
| `--uninstall`  |         | CA sertifikasını sistemden kaldırır                           |
| `--help`       | `-h`    | Yardım mesajını gösterir                                      |

## Yapılandırma Dosyası (Opsiyonel)

Projenizin kök dizininde `localssl.config.js` dosyası oluşturarak ayarlarınızı sabitleyebilirsiniz:

```javascript
// localssl.config.js
module.exports = {
  domains: ["localhost", "my-app.local"],
  output: "./ssl",
};
```

## Destek

Bu araç işinize yaradıysa, bir kahve ısmarlayabilirsiniz ☕

[Buy Me a Coffee](https://www.buymeacoffee.com/omerkargin)
