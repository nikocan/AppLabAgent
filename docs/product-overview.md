# Ürün Genel Bakışı

App Lab Agent, uygulama geliştirme ekiplerinin fikir, tasarım, geliştirme, test, dağıtım ve operasyon süreçlerini yapay zeka ajanları ve otomasyon senaryolarıyla hızlandıran uçtan uca bir platformdur. Bu doküman, platformun hedeflediği kullanıcı profillerini, değer önerilerini ve kritik kullanıcı yolculuklarını açıklar.

## Kullanıcı Profilleri

1. **Ürün Sahibi (PO):** Özellik önceliklendirmesi, gereksinim yönetimi ve yayın planlamasından sorumludur.
2. **Geliştirici:** Mobil ve web modüllerini geliştirir, kod inceleme ve test süreçlerine katılır.
3. **QA Mühendisi:** Test senaryolarını doğrular, cihaz çiftliği sonuçlarını takip eder.
4. **Otomasyon Uzmanı:** n8n akışlarını tasarlar, entegrasyonları yapılandırır.
5. **Operasyon Ekibi:** Dağıtım, izleme, uyarı ve olay müdahalesini yürütür.

## Değer Önerileri

- **Tek noktadan yönetim:** Çoklu servis bağlantıları tek panelden kontrol edilir.
- **Özelleştirilebilir ajanlar:** Görev bazlı davranış kuralları ve yetkilendirme seviyeleri tanımlanabilir.
- **Ajan profili kitaplığı:** Proje bazlı ajan atamaları, rol şablonları ve talimat havuzları tek merkezden yönetilir.
- **Hızlı prototipleme:** Hazır şablonlar ve kod üretim ajanlarıyla MVP süreleri kısalır.
- **Sürekli test:** Cihaz çiftliği entegrasyonları sayesinde regresyon süreçleri hızlanır.
- **Otomatik yayın:** Google Play, App Store, Hostinger ortamları tek tıklamayla güncellenir.

## Kullanıcı Yolculukları

### 1. Proje Başlatma
- Organizasyon ve ekip rolleri tanımlanır.
- GitHub reposu bağlanır, şablon seçilir.
- Ajan orkestratörü görev dağılımlarını otomatik oluşturur.

### 2. Geliştirme Sprinti
- PO backlog oluşturur, ajanlar kullanıcı hikâyesi detaylarını genişletir.
- Geliştirici ajanı kod önerileri ve refactoring planı sunar.
- QA ajanı test senaryoları ve kabul kriterlerini üretir.

### 3. Test & Onay
- n8n akışı CI/CD pipeline’ını tetikler.
- Test ajanı sonuçları raporlar, başarısızlıkta geri bildirim döngüsü açar.
- İnsan onayı adımları gerekli durumlarda devreye alınır.

### 4. Yayın ve Pazarlama
- Yayın ajanı mağaza içeriklerini, ekran görüntülerini ve meta verileri günceller.
- Pazarlama ajanı kampanya planları ve e-posta otomasyonları oluşturur.
- Analitik ajanı, kullanıcı edinimi ve retention metriklerini izler.

### 5. Operasyon ve Destek
- Operasyon ajanı hataları sınıflandırır, Jira/Linear görevleri açar.
- Sentry, Grafana ve Prometheus verileri tek panelde görselleştirilir.
- Kullanıcı geri bildirim ajanı, anket ve değerlendirmeleri işler.

## Başarı Göstergeleri

| Metri̇k | Açıklama | Hedef |
| --- | --- | --- |
| MVP Teslim Süresi | Fikirden yayınlanan MVP’ye kadar geçen süre | %40 azalma |
| Otomatik Test Kapsamı | Toplam testlerin otomatikleşen oranı | %80 |
| Manuel Yayın İşlemleri | İnsan müdahalesi gerektiren yayın adımları | <%10 |
| Kullanıcı Memnuniyeti | NPS/CSAT skorları | 8+/10 |
| Ekip Verimliliği | Sprint başına tamamlanan hikâye sayısı | %30 artış |

## Rekabet Avantajları

- Çoklu ajan yönetimi için özel orkestrasyon katmanı
- Hostinger, GitHub ve n8n için derin entegrasyonlar
- Mobil ve web dağıtımlarını aynı pipeline’da yönetme yeteneği
- AI tabanlı içerik, test ve operasyon destek araçları

## Gelecek İyileştirmeler

- Low-code editör ve tasarım sistemleriyle daha hızlı ekran üretimi
- AI modellerinin özelleştirilmesi için AutoML altyapısı
- Marketplace: Hazır ajan paketleri ve n8n akışları paylaşımı
- Müşteri içgörüleri için veri gölü ve analitik paneller

---
Bu doküman, App Lab Agent’ın ürün stratejisinin temelini oluşturur ve diğer teknik belgeler için referans sağlar.
