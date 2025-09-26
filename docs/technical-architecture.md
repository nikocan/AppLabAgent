# Teknik Mimari

Bu doküman, App Lab Agent platformunun yüksek seviyeli teknik mimarisini ve temel bileşenlerini açıklar. Amaç, ekiplerin altyapı kararlarını, ölçeklenebilirlik gereksinimlerini ve güvenlik prensiplerini net şekilde anlamasını sağlamaktır.

## Mimarinin Katmanları

1. **Sunum Katmanı**
   - Flutter tabanlı mobil uygulama
   - Next.js tabanlı web portalı
   - Tasarım sistemi: Tailwind + özel bileşen kütüphaneleri
2. **API & Orta Katman**
   - NestJS/Node.js tabanlı GraphQL API
   - Webhook işleyiciler ve real-time abonelikler (GraphQL Subscriptions)
   - API ağ geçidi, oran sınırlama ve JWT tabanlı oturum yönetimi
3. **Ajan Orkestrasyonu**
   - LangChain, OpenAI Functions, özel LLM servisleri
   - Görev kuyruğu (Redis Streams) ve koordinasyon (Temporal.io)
   - Ajan görev kayıtları ve telemetri veri tabanı
4. **Otomasyon & Workflow**
   - n8n self-hosted örnekleri
   - GitHub Actions ve Terraform tabanlı altyapı kodu
   - Hostinger API entegrasyon katmanı
5. **Veri Katmanı**
   - PostgreSQL (temel veri)
   - Redis (önbellek, oturum, kuyruklar)
   - S3 uyumlu obje depolama (Hostinger veya AWS)
6. **İzleme & Güvenlik**
   - Prometheus, Grafana, Loki/Sentry
   - HashiCorp Vault veya AWS Secrets Manager
   - WAF, IDS/IPS ve audit log servisleri

## Veri Akışları

1. **Görev Akışı**
   - Kullanıcı arayüzü -> GraphQL API -> Ajan Orkestratörü -> Workflow -> Otomasyon/Entegrasyon.
2. **Kod Dağıtım Akışı**
   - Git push -> GitHub Actions -> Build pipeline -> Hostinger + Mobil dağıtımlar.
3. **Test Akışı**
   - Test tetikleyici -> CI pipeline -> Cihaz çiftliği -> Raporlama ajanı -> Portal.
4. **Geri Bildirim Akışı**
   - Kullanıcı telemetrisi -> Analitik ajanı -> İçgörü panelleri -> PO bildirimleri.

## Bileşen Detayları

### Kullanıcı Portalı
- Next.js + Apollo Client
- SSR/ISR stratejisi ile hızlı yükleme ve SEO uyumu
- RBAC yetkilendirmesi için GraphQL directive tabanlı kontroller

### Mobil Uygulamalar
- Flutter modüler yapısı, çoklu hedef (Android, iOS)
- CI/CD pipeline: Fastlane + Firebase App Distribution + TestFlight
- Dinamik içerik güncellemeleri için Remote Config

### Ajan Orkestratörü
- Görev türleri: kod üretimi, test, dağıtım, operasyon, destek
- Prompt yönetimi ve sürümleme için özel depo
- Erişim kontrolleri: Her ajan için scoped API anahtarları

### Ajan Profili Kaydı
- Ajan metadata deposu: sağlayıcı, model, talimat ve yetenek setleri.
- Proje bazlı ilişkilendirme ve görev önceliklendirme bilgileri.
- REST API ile CRUD işlemleri, orchestrator cache senkronizasyonu.

### Workflow Motoru
- n8n node’ları: GitHub, Hostinger, Slack, Jira, Linear, Notion
- İnsan-in-the-loop (HITL) adımları için manuel onay modülü
- Zamanlanmış görevler ve olay tetiklemeleri

### Dağıtım Katmanı
- Terraform ile Hostinger VPS veya Kubernetes cluster yönetimi
- Docker image registry (GitHub Container Registry)
- CDN ve edge caching stratejileri

### İzleme & Uyarılar
- Prometheus exporter’ları (API, ajan, workflow, database)
- Grafana dashboard setleri (performans, hata oranı, dağıtım metrikleri)
- Sentry hata izleme ve release health

## Güvenlik Modeli

- **Kimlik & Erişim:** OAuth 2.0, SSO, RBAC, API token’ları.
- **Veri Koruma:** TLS 1.3, JWT imzalama, veri maskeleme.
- **Uyumluluk:** SOC2 kontrolleri, audit log retention, gizlilik politikaları.
- **Olay Müdahalesi:** SIEM entegrasyonu, otomatik uyarılar, olay müdahale runbook’ları.

## Ölçeklenebilirlik Stratejisi

- Kubernetes ile yatay ölçeklenebilir mikro servis mimarisi
- Otomatik ölçekleme (HPA) ve burst kapasitesi için bulut kaynakları
- Redis cluster ve PostgreSQL read replica mimarisi
- Event-driven mimari ile kuyruk tabanlı yük dengeleme

## Yedekleme & Süreklilik

- PostgreSQL için günlük yedekler, point-in-time recovery
- Obje depolama için sürümleme ve lifecycle politikaları
- DR planı: Farklı bölgede yedek n8n ve API örnekleri

## Entegrasyon Matrisi

| Servis | Kullanım | Protokol |
| --- | --- | --- |
| GitHub | Kod depolama, issues, Actions | REST, GraphQL |
| Hostinger | Uygulama dağıtımı, DNS yönetimi | REST API |
| n8n | Otomasyon akışları | REST, Webhook |
| Firebase | Test dağıtımı, analitik | REST, gRPC |
| App Store Connect | iOS paket yükleme | REST API |
| Google Play Developer | Android yayın | REST API |
| Slack/Teams | Bildirim ve onay | Webhook |

## Açık Sorular

- Ajanların maliyet optimizasyonu için özel LLM barındırma mı kullanılacak?
- Kullanıcıların kendi ajan modellerini yükleyebilmesi desteklenecek mi?
- On-premise kurulum ihtiyacı olan müşteriler için nasıl bir dağıtım modeli uygulanacak?

---
Bu mimari, ürün ihtiyaçlarına göre gelişecektir. Her yeni bileşen eklendiğinde doküman güncellenmelidir.
