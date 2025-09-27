# AppLabAgent

App Lab Agent, yapay zeka destekli uygulama geliştirme süreçlerinde hesap bağlantıları,
projeler ve otomasyon akışlarını tek noktadan yönetmeye odaklanan modüler bir Python
paketidir. Paket, hesapları güvenli biçimde kaydetmek, projeleri planlamak ve otomasyon
reçetelerini doğrulamak için hafif bileşenler sunar.

## Özellikler

- Harici servis hesaplarını `AccountRegistry` ile kayıt altına alma ve serileştirme.
- `ProjectWorkspace` sayesinde görev panoları olan projeler oluşturma ve hesap bağlama.
- Proje görevlerini `start_task`, `block_task` ve `complete_task` kısayollarıyla ilerletme.
- Sorumlu bazlı görev raporları ve iş yükü özetleriyle ekip kapasitesini planlama.
- Yol haritası yönetimi için kilometre taşları ekleyip tamamlayarak teslim tarihlerini takip etme.
- Teslim tarihi geçmiş kilometre taşlarını raporlayarak riskleri erken yakalama.
- `AutomationStudio` ile otomasyon tariflerini doğrulama ve n8n uyumlu çıktılar alma.
- `AppLabAgentPlatform` sınıfı ile tüm bileşenleri orkestre ederek uçtan uca senaryoları
  yönetme.
- Teknoloji yığınlarını bağlı hesap ve otomasyonlarla eşleştirmek için
  `integration_audit` raporuyla entegrasyon boşluklarını izleme.
- Frontend ön izlemeleri için `project_workspace` ve `TaskBoard.export_tasks`
  yardımcılarıyla pano verilerini JSON olarak çıkarma.
- `DatabaseSchema` sayesinde platform durumunu sözlük olarak dışa aktarma ve tekrar
  yükleme.

## Kurulum

Projeyi sisteminize klonladıktan sonra Python 3.11+ sürümüne sahip olduğunuzdan emin olun.
Gerekli bağımlılık yalnızca `pytest` olduğu için aşağıdaki komutla yükleyebilirsiniz:

```bash
pip install pytest
```

## Testler

Tüm testleri çalıştırmak için:

```bash
pytest
```

## Hızlı Örnek

```python
from app_lab_agent import AppLabAgentPlatform

platform = AppLabAgentPlatform()
platform.link_account("github", "studio", {"plan": "team"})
platform.create_project(
    name="Automation",
    description="Müşteriler için otomasyon platformu",
    tech_stack=["python", "n8n"],
    goals=["MVP"],
    tasks=[
        {
            "identifier": "setup-ci",
            "title": "CI hattını kur",
            "description": "Test ve kalite kontrolleri ekle",
            "owner": "Leyla",
        },
        {
            "identifier": "draft-spec",
            "title": "Özeti yaz",
            "description": "Beklenen akışları dokümante et",
        },
    ],
)
platform.add_project_milestone(
    "Automation",
    title="Demo sunumu",
    due_date="2025-01-15",
    description="İlk müşteri demosunu hazırlama",
)
platform.create_automation(
    name="Deploy bot",
    trigger="pull_request",
    actions=["lint", "deploy"],
    required_accounts=["github:studio"],
)
summary = platform.portfolio_overview()
upcoming = platform.upcoming_project_milestones(limit=3)
overdue = platform.overdue_project_milestones(reference_date="2025-02-01")
owner_report = platform.list_tasks_for_owner("Leyla", include_unassigned=True)
workload = platform.owner_workload_report(include_unassigned=True)
integration_gaps = platform.integration_audit()

# Platform durumunu kalıcı hale getirmek için veriyi şemalaştırma
from app_lab_agent.storage import DatabaseSchema

schema = DatabaseSchema.from_platform(platform)
snapshot = schema.to_dict()
restored_platform = DatabaseSchema.from_dict(snapshot).to_platform()
```

Bu örnek, temel hesap ve proje yapılandırmasını oluşturup platform özetini üretir.
`owner_workload_report` çıktısı ise sorumlulara göre görev adetlerini ve durum dağılımını
proje kırılımıyla birlikte sağlar. `integration_audit` ise teknoloji yığınındaki her
kalemin kayıtlı hesaplar ve otomasyonlarla eşleşip eşleşmediğini denetleyerek eksik
entegrasyonları hızlıca yakalamanıza yardımcı olur.

## Frontend ile Entegrasyon

AppLabAgent yalnızca Python API'leri sağlar; ancak bu API'leri HTTP servisleri üzerinden
frontend uygulamalarına aktarabilirsiniz. FastAPI veya Flask gibi hafif çerçeveler ile
`AppLabAgentPlatform` verilerini JSON olarak sunarak görev panolarını, kilometre taşı
listelerini ve iş yükü raporlarını web arayüzlerinde gösterebilirsiniz. Ayrıntılı adımlar
ve örnek kodlar için [`docs/frontend_integration.md`](docs/frontend_integration.md)
dosyasına göz atın.
