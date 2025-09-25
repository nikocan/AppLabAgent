# Otomasyon Senaryoları

Bu doküman, App Lab Agent platformunda kullanılan n8n ve GitHub Actions tabanlı otomasyon akışlarını tanımlar. Amaç, her bir iş akışının tetikleyicilerini, adımlarını ve çıktısını standart bir formatta belgelemektir.

## n8n Akış Şablonları

### 1. Kod Üretimi & Pull Request Akışı
- **Tetikleyici:** Proje panosunda "Kod Üret" görevinin tamamlanması.
- **Adımlar:**
  1. Görev detaylarını GraphQL API’den al.
  2. Kod ajanını çağır, önerilen değişiklikleri al.
  3. GitHub branch oluştur, dosya güncellemelerini uygula.
  4. PR şablonu doldur, ilgili ekibe bildirim gönder.
- **Çıktı:** Otomatik oluşturulmuş PR, Slack/Jira bildirimi.

### 2. Test Pipeline Senaryosu
- **Tetikleyici:** GitHub PR açılması veya güncellenmesi.
- **Adımlar:**
  1. GitHub Actions pipeline durumunu izle.
  2. Cihaz çiftliği (Firebase Test Lab) testlerini başlat.
  3. Test sonuçlarını topla, rapor ajanına ilet.
  4. Başarısız testlerde görev aç, ekibi uyar.
- **Çıktı:** Test raporu, JIRA/Linear görevi, Slack bildirimi.

### 3. Yayın Hazırlığı Akışı
- **Tetikleyici:** "Release" etiketi oluşturulması.
- **Adımlar:**
  1. Sürüm notu ajanı ile değişiklik listesi oluştur.
  2. Fastlane komutlarını tetikle (Android/iOS).
  3. App Store Connect ve Google Play’e paket yükle.
  4. Hostinger staging/live ortamlarını güncelle.
- **Çıktı:** Yayınlanan sürüm, güncellenmiş mağaza içerikleri, dağıtım raporu.

### 4. Pazarlama Kampanyası Akışı
- **Tetikleyici:** Yeni sürüm yayını.
- **Adımlar:**
  1. Pazarlama ajanı ile kampanya metinleri oluştur.
  2. E-posta otomasyon sistemlerine (Brevo, Mailchimp) gönder.
  3. Sosyal medya planlayıcılarına (Buffer) içerik ekle.
  4. Analitik ajanı için UTM parametrelerini oluştur.
- **Çıktı:** Kampanya gönderileri, performans izleme panelleri.

## GitHub Actions Pipeline’ları

| Pipeline | Açıklama | Önemli Adımlar |
| --- | --- | --- |
| `build-test.yml` | Kod derleme ve testleri çalıştırır | Node setup, Flutter build, Jest/Unit testler, rapor yükleme |
| `deploy-hostinger.yml` | Hostinger ortamlarına dağıtım yapar | Terraform plan/apply, Docker push, SSH deploy |
| `release-mobile.yml` | Mobil paket üretimi ve mağazalara yükleme | Fastlane lanes, App Store Connect API, Google Play API |
| `security-scan.yml` | Güvenlik ve lisans taramaları | Snyk/Trivy, Dependabot raporları |

## Otomasyon İlkeleri

1. **İzlenebilirlik:** Her otomasyon adımı loglanmalı ve portalda görünmelidir.
2. **İnsan Onayı:** Kritik dağıtım adımlarında manuel onay katmanı bulunmalıdır.
3. **Tekrarlanabilirlik:** Şablonlar versiyonlanmalı, değişiklikler review sürecinden geçmelidir.
4. **Hata Geri Bildirimi:** Hatalar otomatik olarak ilgili ekibe yönlendirilmelidir.
5. **Güvenlik:** Gizli anahtarlar Vault’da tutulmalı, minimum izin prensibi uygulanmalıdır.

## Örnek n8n Node Konfigürasyonları

```json
{
  "name": "GitHub API Call",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "https://api.github.com/repos/{{ $json.repo }}/pulls",
    "method": "POST",
    "authentication": "oAuth2"
  }
}
```

```json
{
  "name": "Hostinger Deploy",
  "type": "n8n-nodes-base.ssh",
  "parameters": {
    "command": "deploy_app.sh {{ $json.releaseTag }}",
    "sshAuthentication": "keyPair"
  }
}
```

## İzleme & Alarmlar

- n8n, Prometheus exporter ile iş akışı metriklerini yayınlar.
- Pipeline başarısızlıkları için PagerDuty/Slack uyarıları kurulur.
- Başarılı dağıtımlar sonrası rapor ajanı, e-posta ve portal bildirimleri gönderir.

---
Tüm otomasyon şablonları `automation/` klasöründe versiyonlanmalı ve değişiklikler kod incelemesinden geçmelidir.
