# Frontend Entegrasyon Rehberi

AppLabAgent paketi doğrudan bir kullanıcı arayüzü sunmaz; ancak mevcut Python API'lerini
kullanarak frontend projelerine veri sağlayabilirsiniz. Bu rehber, görev ve proje
bilgilerini web tabanlı arayüzlerde göstermek için temel entegrasyon adımlarını
anlatmaktadır.

## 1. Platform Katmanını Servisleştirme

İlk adım, `AppLabAgentPlatform` örneğini HTTP üzerinden servis etmek için hafif bir web
çerçevesi (ör. FastAPI veya Flask) kullanmaktır. Aşağıdaki örnek, FastAPI ile görev
listesini yayınlayan basit bir uç nokta tanımlar:

```python
"""FastAPI ile AppLabAgentPlatform verilerini servis etme örneği."""
from fastapi import FastAPI
from app_lab_agent import AppLabAgentPlatform

app = FastAPI(title="AppLabAgent API")
platform = AppLabAgentPlatform()


@app.get("/projects/{project_name}/tasks")
def list_project_tasks(project_name: str):
    """İstenen projenin görevlerini frontend'e JSON olarak aktar."""

    workspace = platform.project_workspace(project_name)
    return workspace.board.export_tasks()
```

Bu servis, frontend uygulamanızın ihtiyaç duyduğu veri formatını üretir. Daha ileri
senaryolarda, hesap bağlama veya otomasyon tariflerini tetikleme için ek uç noktalar
oluşturabilirsiniz.

## 2. Frontend İsteklerini Planlama

- **Durum yönetimi:** Frontend tarafında, görev panoları ve kilometre taşları gibi
  veri setlerini önbelleğe almak için bir durum yönetim kütüphanesi (Redux, Zustand vb.)
  kullanın.
- **Gerçek zamanlı güncellemeler:** Görev durum geçişlerini (başlatma, tamamlama,
  bloklama) websocket veya SSE ile dinleyerek kullanıcılara anlık geri bildirim verin.
- **Filtreleme ve sıralama:** `list_tasks_for_owner`, `overdue_project_milestones`
  gibi platform yardımcılarını parametreleriyle çağırarak frontend filtrelerini basit
  tutun.

## 3. UI Bileşenlerini Haritalama

Frontend komponentlerinizi AppLabAgent veri modeline göre yapılandırın:

- **Görev kartları:** `Task` nesnesinin `identifier`, `title`, `status`, `owner`
  alanlarını kart bileşenlerinde gösterin.
- **İlerleme özetleri:** `owner_workload_report` çıktısını kullanarak sorumlu bazlı
  istatistik grafiklerini (progress bar, donut chart vb.) çizdirin.
- **Kilometre taşı listeleri:** `ProjectWorkspace.upcoming_milestones` ve
  `ProjectWorkspace.overdue_milestones` sonuçlarını tablo veya takvim bileşenlerinde
  sergileyin.

## 4. Menü Yapısını Doğrulama

- `AppLabAgentPlatform.navigation_menu()` metodunu çağırarak tüm menü bölümlerini tek
  seferde elde edin.
- Dönen yapının `missing_sections` ve `empty_sections` alanlarını kontrol ederek backend
  veritabanında eksik kayıt olup olmadığını hızlıca anlayın.
- Menü maddeleri, `route` ve `badge` alanlarıyla frontend yönlendirmelerini kolaylaştırır;
  bu sayede durum rozetleri veya sayım etiketlerini doğrudan UI bileşenlerine bağlayın.

## 5. Stil ve Yerelleştirme

- Uygulama temalarınızı AppLabAgent verilerinin yerelleştirilmiş metinleriyle uyumlu
  hale getirmek için i18n katmanları kullanın.
- Durum bazlı renk kodlarını ("in_progress", "blocked", "completed") tasarım
  sisteminizde belirleyip tüm kartlarda tutarlı biçimde uygulayın.

## 6. Geliştirme Akışı Önerileri

1. Backend servisinizde örnek veri seti oluşturun ve snapshot'ını `DatabaseSchema`
   ile kaydedin.
2. Frontend geliştirme ortamında bu snapshot'ı mock API cevabı olarak kullanın.
3. UI bileşenlerini gerçek API'ya bağlamadan önce snapshot verisiyle test ederek
   tasarım geri bildirim döngüsünü hızlandırın.

Bu adımları izleyerek AppLabAgent'ın sağladığı proje ve görev yönetimi yeteneklerini
frontend uygulamalarınıza hızlı biçimde entegre edebilirsiniz.
