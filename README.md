# App Lab Agent

App Lab Agent, yapay zeka destekli ajan orkestrasyonunu, otomasyonları ve çoklu platform dağıtımını bir arada sunarak ekiplerin fikirden yayınlamaya kadar tüm uygulama yaşam döngüsünü tek bir yerden yönetmesini sağlayan bulut tabanlı bir geliştirme platformudur. Platform, GitHub, Hostinger, n8n, analitik servisleri ve üçüncü parti yapay zeka ajanları gibi farklı hesap ve hizmetleri entegre ederek hem test hem de uygulama geliştirme süreçlerini uçtan uca otomatikleştirir.

Ürün, Hostinger altyapısında barındırılan `applabagent.net` alan adı üzerinden hizmet verir ve alan adı yapılandırması, otomasyon tetikleri ile mobil mağaza yayın akışları tek bir orkestrasyon katmanında toparlanır.

## Ürün Vizyonu

- **Fikirden mağazaya tek platform:** Ürün keşfi, prototipleme, geliştirme, test, sürümleme ve mağaza yayınlarını aynı çatı altında toplar.
- **Ajan destekli üretkenlik:** Kod üretimi, test senaryoları, QA raporları, içerik lokalizasyonu gibi görevler yapay zeka ajanlarıyla otomatikleşir.
- **Otomasyonla güvenli ölçeklenebilirlik:** GitHub akışları, Hostinger dağıtımları ve n8n tabanlı iş akışları sayesinde tekrar eden görevler kodsuz olarak yönetilir.
- **Çoklu platform dağıtımı:** Android, iOS ve web uygulamaları tek kod tabanından oluşturulur, test edilir ve dağıtılır.

## Ana Yetenekler

| Alan | Özellikler |
| --- | --- |
| Hesap Entegrasyonu | OAuth 2.0 tabanlı bağlantılar, rol bazlı yetki devirleri, audit logları |
| Yapay Zeka Ajanları | Kod asistanları, test ajanı, yayın asistanı, operasyon analisti |
| Otomasyon | n8n senaryoları, GitHub Actions, Hostinger API entegrasyonları |
| Test & QA | Otomatik test üretimi, cihaz çiftliği entegrasyonu, kullanıcı kabul testleri |
| Yayın & Pazarlama | Android APK/AAB üretimi, iOS TestFlight, App Store & Google Play teslimi |
| İzleme & Operasyon | Canlı sağlık kontrolleri, Log toplama, uyarı panelleri |

## Modüler Mimari

```
┌────────────────────┐     ┌────────────────────┐
│  Kullanıcı Portalı │◄───►│  Yetkilendirme     │
└────────┬───────────┘     └─────────┬──────────┘
         │                            │
         ▼                            ▼
┌────────────────────┐     ┌────────────────────┐
│  Ajan Orkestratörü │◄───►│  İş Akışı Motoru   │
└────────┬───────────┘     └─────────┬──────────┘
         │                            │
         ▼                            ▼
┌────────────────────┐     ┌────────────────────┐
│  App Builder       │◄───►│  Dağıtım Merkezi   │
└────────────────────┘     └────────────────────┘
```

### 1. Kullanıcı Portalı
- Organizasyon yönetimi, proje panelleri ve görev atamaları sağlar.
- Ekip rolleri ve erişim kontrolü için RBAC modeli uygular.

### 2. Yetkilendirme Katmanı
- GitHub, Hostinger, n8n ve diğer SaaS servisleriyle güvenli anahtar yönetimi sunar.
- OAuth 2.0 ve API anahtar kasasıyla audit trail oluşturur.

### 3. Ajan Orkestratörü
- Çoklu yapay zeka ajanlarını tek koordinasyon katmanında toplar.
- Görev önceliklendirme, mesajlaşma, hata toleransı ve model seçimi kurallarını içerir.

### 4. İş Akışı Motoru (n8n + Özel Akışlar)
- Kod oluşturma, test planı, dağıtım ve raporlama senaryolarını tetikler.
- İnsan onayı gerektiren adımlar için bekleme durumları ve SLA takibi yapar.

### 5. App Builder
- Flutter/React Native tabanlı çapraz platform şablonları yönetir.
- Modül, sayfa ve bileşen bazlı sürükle-bırak düzenleme sağlar.

### 6. Dağıtım Merkezi
- Hostinger üzerinde staging/live ortamlarına otomatik yayın yapar.
- GitHub Actions ile CI/CD, Firebase App Distribution, TestFlight ve Play Console entegrasyonlarını yönetir.

## Kullanım Senaryoları

1. **Yeni ürün keşfi:** Ürün sahibi özellikleri tanımlar, ajanlar ürün gereksinim belgelerini ve kullanıcı hikâyelerini üretir.
2. **Otomatik prototipleme:** Tasarım ajanı ekran akışlarını oluşturur, App Builder prototipleri derler.
3. **Kod üretimi & test:** Kod ajanı modüler kod parçaları üretir, test ajanı otomatik senaryolar ve raporlar oluşturur.
4. **Dağıtım & yayın:** CI/CD hattı APK/AAB ve IPA paketlerini oluşturur; yayın ajanı mağaza listinglerini günceller.
5. **Operasyon & bakım:** Canlı izleme, hata ayıklama ajanları, kullanıcı geri bildirim döngüleri.

## Teknoloji Yığını

- **Ön yüz:** Flutter (mobil), Next.js (web), Tailwind CSS, Storybook.
- **Arka uç:** Node.js (NestJS), GraphQL API, PostgreSQL, Redis, Hasura.
- **Ajan Katmanı:** LangChain, OpenAI/GPT, Hugging Face Hub, özel LLM barındırmaları.
- **Otomasyon:** n8n, Temporal.io, GitHub Actions, Terraform, Docker, Kubernetes.
- **Dağıtım:** Hostinger VPS/Kubernetes, Firebase App Distribution, App Store Connect API, Google Play Developer API.
- **İzleme:** Grafana, Prometheus, Sentry, Elastic Stack.

## Güvenlik ve Uyumluluk

- Zero-trust erişim modeli, SSO entegrasyonları (Okta, Azure AD).
- Şifreleme: Transit (TLS 1.3), at-rest (AES-256), gizlilik için gizli anahtar kasaları.
- Denetim: SOC2, ISO 27001 uyum hedefleri, günlük saklama politikaları.

## Yol Haritası

| Çeyrek | Başlık | Açıklama |
| --- | --- | --- |
| Q1 | Çekirdek platform | Ajan orkestratörü, proje yönetimi ve GitHub entegrasyonu |
| Q2 | Otomasyon genişletme | n8n şablon kütüphanesi, Hostinger dağıtımı, test çiftliği entegrasyonu |
| Q3 | Mobil dağıtım | Android/iOS yayın hattı, mağaza içeriği otomasyonu |
| Q4 | Pazarlama & Analitik | Kullanıcı segmentasyonu, kampanya ajanları, ürün analitiği |

## Başlangıç Rehberi

1. **Organizasyon oluştur:** Çoklu ekip ve proje yapısını tanımla.
2. **Hesapları bağla:** GitHub, Hostinger, n8n, analitik ve üçüncü parti ajan sağlayıcılarını OAuth ile bağla.
3. **Şablon seç:** App Builder içindeki hazır şablonlardan veya boş projeden başla.
4. **Ajanları yapılandır:** Görev bazlı ajan profilleri, yetkiler ve gözlem parametrelerini ata.
5. **İş akışlarını çalıştır:** n8n senaryolarıyla otomatik kod üretimi, test ve dağıtım adımlarını tetikle.
6. **Dağıt ve izle:** Mobil paketleri üret, mağazalara gönder, operasyon panellerinden performansı takip et.

## Referans Uygulama İskeleti

Depoda, App Lab Agent mimarisini kavramsal olarak göstermek amacıyla Node.js tabanlı hafif bir HTTP sunucusu yer alır. Bu iskelet,
entegrasyon durumlarını simüle eder ve ajan görevlerinin n8n iş akışları ile Hostinger dağıtımlarına nasıl bağlanacağını örnekler.

### Sunucuyu Çalıştırma

```bash
npm install
npm start
```

Varsayılan olarak `http://localhost:4000` adresinde çalışan sunucu aşağıdaki uç noktaları sağlar:

- `POST /api/integrations/github/connect` — GitHub bağlantısını kaydeder.
- `POST /api/integrations/hostinger/deploy` — Hostinger üzerinde yayın tetikler.
- `POST /api/integrations/n8n/trigger` — n8n iş akışını simüle eder.
- `POST /api/tasks` — Ajan görevini kaydeder.
- `POST /api/tasks/:id/dispatch` — Görevi kuyruğa alır.
- `POST /api/queue/process` — Kuyruktaki ilk görevi işleyerek n8n ve Hostinger tetiklerini çalıştırır.
- `POST /api/agents` — Yapay zeka ajan profilini oluşturur ve varsayılan yetenekleri kaydeder.
- `GET /api/agents` — Kayıtlı ajan profillerini proje filtresiyle birlikte döndürür.
- `GET /api/agents/:id` — Tek bir ajan profilinin sağlayıcı, model ve talimat detaylarını getirir.
- `PATCH /api/agents/:id` — Ajan profilinin yeteneklerini veya talimatlarını günceller.
- `POST /api/agents/:id/link` — Ajanı belirli bir projeye bağlar ve görev havuzunda önceliklendirir.
- `DELETE /api/agents/:id` — Ajan profilini ve ilişkili meta veriyi kaldırır.
- `POST /api/projects` — Yeni bir proje kaydı oluşturur ve açıklama ekler.
- `POST /api/projects/:id/integrations` — Projeyi GitHub, Hostinger, n8n gibi entegrasyonlara bağlar.
- `POST /api/projects/:id/tasks` — Projenin otomasyon görevlerini çalışma politikalarıyla ilişkilendirir.
- `GET /api/projects` — Kayıtlı tüm projelerin özet listesini döndürür.
- `GET /api/projects/:id` — Tekil bir projenin ayrıntılı yapılandırmasını getirir.
- `POST /api/workflows` — Otomasyon iş akışını kaydeder ve proje/ajan bağlamı ile saklar.
- `POST /api/workflows/:id/attach-task` — İş akışını mevcut ajan görevleriyle ilişkilendirir.
- `POST /api/workflows/:id/trigger` — İş akışını bağlam verisiyle kuyruğa alarak çalıştırır.
- `GET /api/workflows` — Kayıtlı iş akışlarının listesini döndürür.
- `GET /api/environment` — Platformun alan adı, Hostinger bağlantısı ve yayın kanalı özetini döndürür.
- `POST /api/environment/domain` — Alan adını günceller ve Hostinger bağlantısını `applabagent.net` ile senkronize eder.
- `POST /api/environment/releases` — Android/iOS/web yayın kanallarını kaydeder.
- `POST /api/builds` — Bir projenin Android/iOS derleme kaydını oluşturur ve kuyruğa hazırlar.
- `POST /api/builds/:id/trigger` — Oluşturulan derlemeyi otomasyon kuyruğuna gönderir.
- `PATCH /api/builds/:id/status` — Derleme durumunu manuel olarak günceller ve geçmişe not ekler.
- `GET /api/builds` — Derlemeleri proje, platform veya duruma göre filtreler.
- `GET /api/builds/:id` — Tekil derlemenin durumunu, artefact bağlantısını ve geçmişini döndürür.
- `POST /api/releases` — Çoklu platform sürüm kaydını oluşturur ve platform varsayılanlarını ayarlar.
- `GET /api/releases` — Sürüm özetlerini proje bazında listeler.
- `GET /api/releases/:id` — Seçilen sürümün platform durumları ve tarihçesini döndürür.
- `POST /api/releases/:id/platforms` — Platforma build bağlar veya mağaza durumunu günceller.
- `POST /api/releases/:id/promote` — Sürüm durumunu (draft, in_progress, published vb.) değiştirir.
- `POST /api/releases/:id/timeline` — Serbest metin kilometre taşı mesajlarını sürüm geçmişine ekler.

Tüm uç noktalar JSON isteği kabul eder ve örnek akışları simüle etmek üzere bellek içi durum deposu kullanır.

### Testleri Çalıştırma

```bash
npm test
```

`node:test` tabanlı senaryolar, entegrasyonların ve otomasyon kuyruğunun beklendiği gibi davrandığını doğrular.

## Dokümantasyon

- [Ürün Genel Bakışı](docs/product-overview.md)
- [Teknik Mimari](docs/technical-architecture.md)
- [Otomasyon Senaryoları](docs/automation-blueprints.md)
- [Mobil Dağıtım Kılavuzu](docs/mobile-distribution.md)

---

App Lab Agent, geliştiricilerin ve ürün ekiplerinin üretkenliğini artırmak için oluşturulmuş modern ve güvenli bir platformdur. Bu depo, platform mimarisini, otomasyon stratejilerini ve uçtan uca yayın sürecini belgelemek için kullanılacaktır.
