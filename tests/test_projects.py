"""ProjectWorkspace bileşeninin temel senaryolarını doğrular."""

import pytest

from app_lab_agent.accounts import AccountRegistry
from app_lab_agent.projects import MilestoneStatus, ProjectWorkspace, ProjectWorkspaceError
from app_lab_agent.tasks import TaskStatus


# Proje oluşturma, görev ekleme ve hesap bağlama akışını test eder.
def test_create_project_and_link_account():
    accounts = AccountRegistry()
    accounts.register("github", "studio", {"plan": "team"})
    workspace = ProjectWorkspace(accounts)

    project = workspace.create_project(
        name="App Platform",
        description="Müşteriler için otomasyon platformu",
        tech_stack=["python", "fastapi"],
        goals=["MVP teslimi"],
    )
    workspace.add_task_to_project(
        "App Platform",
        identifier="design",
        title="Bilgi mimarisi",
        description="Bilgi mimarisi çalışmasını tamamla",
    )
    linked = workspace.link_account_to_project("App Platform", "github", "studio")

    assert project.summary()["progress"]["total"] == 1
    assert linked.name == "studio"
    assert workspace.status_overview()["App Platform"]["pending"] == 1


# Belirli sağlayıcısı olmayan projeleri döndürme davranışını test eder.
def test_find_projects_needing_account_filters_correctly():
    accounts = AccountRegistry()
    accounts.register("github", "studio")
    workspace = ProjectWorkspace(accounts)
    workspace.create_project(
        name="Automation",
        description="n8n entegrasyonu",
        tech_stack=["n8n", "supabase"],
    )
    workspace.create_project(
        name="Website",
        description="Kurumsal site",
        tech_stack=["astro"],
    )
    workspace.link_account_to_project("Website", "github", "studio")

    missing = workspace.find_projects_needing_account("github")
    assert [project.name for project in missing] == ["Automation"]


# Görev durumlarını çalışma alanı üzerinden ilerletebildiğimizi doğrular.
def test_workspace_can_advance_task_statuses():
    accounts = AccountRegistry()
    workspace = ProjectWorkspace(accounts)
    workspace.create_project(
        name="Ops",
        description="Internal tooling",
        tech_stack=["python"],
    )
    workspace.add_task_to_project(
        "Ops", "draft-spec", "Draft spec", "Outline requirements", owner="Leyla"
    )

    in_progress = workspace.start_task("Ops", "draft-spec", owner="Arda")
    assert in_progress.status.value == "in_progress"
    assert in_progress.owner == "Arda"

    blocked = workspace.block_task("Ops", "draft-spec", reason="Waiting for approval")
    assert blocked.status.value == "blocked"
    assert blocked.notes[-1] == "BLOCKED: Waiting for approval"

    done = workspace.complete_task("Ops", "draft-spec")
    assert done.status.value == "done"


# Kilometre taşlarını ekleme ve tamamlama akışını doğrular.
def test_workspace_manages_milestones():
    workspace = ProjectWorkspace()
    workspace.create_project(
        name="Mobile",
        description="Mobil uygulama",
        tech_stack=["flutter"],
    )

    milestone = workspace.add_milestone(
        "Mobile",
        title="Beta yayını",
        description="Kapalı beta sürümünü yayınla",
        due_date="2024-12-01",
    )
    assert milestone.status == MilestoneStatus.PENDING

    completed = workspace.complete_milestone("Mobile", "Beta yayını")
    assert completed.status == MilestoneStatus.COMPLETED

    upcoming = workspace.upcoming_milestones(include_completed=True)
    assert upcoming[0]["milestone"] == "Beta yayını"
    assert upcoming[0]["status"] == MilestoneStatus.COMPLETED.value


# Geciken kilometre taşlarını raporlayan yardımcı metodu test eder.
def test_workspace_reports_overdue_milestones():
    workspace = ProjectWorkspace()
    workspace.create_project(
        name="Growth",
        description="Kullanıcı kazanımı",
        tech_stack=["python"],
    )

    workspace.add_milestone(
        "Growth",
        title="Aktivasyon analizi",
        description="İlk aktivasyon metriklerini çıkar",
        due_date="2024-01-05",
    )
    workspace.add_milestone(
        "Growth",
        title="Deney kurulumu",
        description="A/B testi kur",
        due_date="2024-01-10",
    )
    late = workspace.add_milestone(
        "Growth",
        title="Rapor sunumu",
        description="Sonuçları paylaş",
        due_date="2024-01-03",
    )
    late.complete()

    invalid = workspace.add_milestone(
        "Growth",
        title="API entegrasyonu",
        description="Partner API'sini bağla",
        due_date="2024-01-08",
    )
    invalid.due_date = "invalid-date"

    overdue = workspace.overdue_milestones(reference_date="2024-01-09")
    assert [entry["milestone"] for entry in overdue] == ["Aktivasyon analizi"]

    overdue_with_completed = workspace.overdue_milestones(
        reference_date="2024-01-09", include_completed=True
    )
    assert [entry["milestone"] for entry in overdue_with_completed] == [
        "Rapor sunumu",
        "Aktivasyon analizi",
    ]

    with pytest.raises(ProjectWorkspaceError):
        workspace.overdue_milestones(reference_date="not-a-date")


# Görevleri sahip bazında topluca raporlayan yardımcı metodu doğrular.
def test_workspace_tasks_for_owner_reports_with_sorting_and_filters():
    workspace = ProjectWorkspace()
    workspace.create_project(
        name="Docs",
        description="Dokümantasyon yenileme",
        tech_stack=["md"],
    )
    workspace.create_project(
        name="Infra",
        description="Altyapı geçişi",
        tech_stack=["terraform"],
    )

    workspace.add_task_to_project(
        "Docs",
        identifier="outline",
        title="Yeni yapı taslağı",
        description="Başlıkları düzenle",
        owner="Leyla",
    )
    workspace.add_task_to_project(
        "Docs",
        identifier="review",
        title="Takım değerlendirmesi",
        description="Geri bildirim topla",
        owner="leyla",
    )
    workspace.add_task_to_project(
        "Infra",
        identifier="migrate-db",
        title="Veritabanını taşı",
        description="Yeni kümeye geçiş",
        owner="Arda",
    )
    workspace.add_task_to_project(
        "Infra",
        identifier="network",
        title="Ağ kuralı incele",
        description="Kuralları optimize et",
    )

    workspace.block_task("Docs", "review", "Bekleyen onay")
    workspace.start_task("Docs", "outline", owner="Leyla")

    report = workspace.tasks_for_owner("LEyla")
    assert [entry["identifier"] for entry in report] == ["review", "outline"]
    assert report[0]["status"] == "blocked"
    assert report[1]["status"] == "in_progress"

    report_with_unassigned = workspace.tasks_for_owner(
        "Leyla", include_unassigned=True
    )
    assert {entry["identifier"] for entry in report_with_unassigned} == {
        "review",
        "outline",
        "network",
    }
    assert next(
        entry for entry in report_with_unassigned if entry["identifier"] == "network"
    )["owner"] is None

    with pytest.raises(ProjectWorkspaceError):
        workspace.tasks_for_owner("   ")


# İş yükü raporunun projeler arası birleştirilmesini test eder.
def test_workspace_owner_workload_groups_projects():
    workspace = ProjectWorkspace()
    workspace.create_project(
        name="Docs",
        description="Dokümantasyon yenileme",
        tech_stack=["md"],
    )
    workspace.create_project(
        name="Infra",
        description="Altyapı geçişi",
        tech_stack=["terraform"],
    )

    workspace.add_task_to_project(
        "Docs",
        identifier="outline",
        title="Yeni yapı taslağı",
        description="Başlıkları düzenle",
        owner="Leyla",
    )
    workspace.add_task_to_project(
        "Docs",
        identifier="review",
        title="Takım değerlendirmesi",
        description="Geri bildirim topla",
        owner="Arda",
    )
    workspace.add_task_to_project(
        "Infra",
        identifier="migrate-db",
        title="Veritabanını taşı",
        description="Yeni kümeye geçiş",
        owner="Leyla",
    )
    workspace.add_task_to_project(
        "Infra",
        identifier="network",
        title="Ağ kuralı incele",
        description="Kuralları optimize et",
    )

    workspace.start_task("Docs", "outline")
    workspace.block_task("Docs", "review", "Bekleyen onay")
    workspace.complete_task("Infra", "migrate-db")

    summary = workspace.owner_workload(include_unassigned=True)

    assert [entry["normalized_owner"] for entry in summary] == [
        "leyla",
        "arda",
        "__unassigned__",
    ]

    leyla_entry = summary[0]
    assert leyla_entry["total"] == 2
    assert leyla_entry["status_breakdown"][TaskStatus.DONE.value] == 1
    assert {
        project_info["project"] for project_info in leyla_entry["projects"]
    } == {"Docs", "Infra"}

    unassigned_entry = summary[-1]
    assert unassigned_entry["owner"] is None
    assert unassigned_entry["status_breakdown"][TaskStatus.PENDING.value] == 1


# Çalışma alanından proje blueprint'ini alıp pano ön izlemesini doğrulayan test.
def test_project_workspace_returns_blueprint_with_board_export():
    workspace = ProjectWorkspace()
    workspace.create_project(
        name="Preview", description="Ön izleme", tech_stack=["python"]
    )
    workspace.add_task_to_project(
        "Preview", "draft", "Taslak", "İçeriği hazırla", owner="Duru"
    )
    workspace.start_task("Preview", "draft")

    project = workspace.project_workspace("Preview")
    assert project.board is project.task_board

    exported = project.board.export_tasks()
    assert exported[0]["identifier"] == "draft"
    assert exported[0]["owner"] == "Duru"
    assert exported[0]["status"] == TaskStatus.IN_PROGRESS.value
