"""AppLabAgentPlatform orkestrasyon davranışlarını sınayan testler."""

import pytest

from app_lab_agent import (
    AppLabAgentError,
    AppLabAgentPlatform,
    AutomationValidationError,
    MilestoneStatus,
    TaskStatus,
    ProjectWorkspaceError,
)


# Platformun uçtan uca proje ve otomasyon senaryosunu yönettiğini test eder.
def test_platform_end_to_end_flow():
    platform = AppLabAgentPlatform()
    platform.link_account("github", "studio", {"plan": "team"})
    platform.link_account("slack", "alerts")

    project = platform.create_project(
        name="Automation",
        description="Otomasyon tasarlama",
        tech_stack=["python", "n8n"],
        goals=["PoC"],
        tasks=[
            {"identifier": "research", "title": "Araştırma", "description": "Rakip analizi"},
        ],
    )
    platform.workspace.link_account_to_project("Automation", "github", "studio")

    recipe = platform.create_automation(
        name="Deploy bot",
        trigger="pull_request",
        actions=["lint", "deploy"],
        required_accounts=["github:studio", "slack:alerts"],
        description="PR açıldığında otomatik kontrol",
    )

    overview = platform.portfolio_overview()
    assert overview["projects"][0]["name"] == project.name
    assert len(overview["accounts"]) == 2
    assert overview["automations"][0]["name"] == recipe.name

    assignment = platform.assign_automation_to_project("Automation", "Deploy bot")
    assert assignment["project"]["name"] == "Automation"
    progress_tasks = assignment["project"]["progress"]["tasks"]
    assert any(task["title"].startswith("Otomasyon devreye alma") for task in progress_tasks)


# Gerekli hesaplar yoksa otomasyon ataması sırasında hata fırlatıldığını test eder.
def test_assign_automation_raises_when_accounts_missing():
    platform = AppLabAgentPlatform()
    platform.create_project("Site", "Kurumsal site", ["astro"], tasks=[])
    platform.create_automation("Notify", "webhook", ["send"], required_accounts=["slack:alerts"])

    try:
        platform.assign_automation_to_project("Site", "Notify")
    except AutomationValidationError as exc:
        assert "Eksik hesaplar" in str(exc)
    else:  # pragma: no cover - hata fırlatılmazsa test başarısız.
        raise AssertionError("Eksik hesaplar için hata bekleniyordu.")


# Projenin ihtiyaç duyduğu hesaplar sağlanmadığında özel hata oluştuğunu test eder.
def test_ensure_project_has_accounts_detects_missing():
    platform = AppLabAgentPlatform()
    platform.create_project("Mobil", "Mobil uygulama", ["flutter"], tasks=[])

    try:
        platform.ensure_project_has_accounts("Mobil", ["github"])
    except AppLabAgentError as exc:
        assert "eksik sağlayıcılar" in str(exc)
    else:  # pragma: no cover - hata bekleniyordu.
        raise AssertionError("Gerekli sağlayıcı eksik olduğunda hata fırlatılmalıydı.")


# Platform API'si üzerinden görev durumlarını yönetebildiğimizi doğrular.
def test_platform_updates_project_tasks():
    platform = AppLabAgentPlatform()
    platform.create_project(
        name="Analytics",
        description="Implement dashboards",
        tech_stack=["python"],
        tasks=[
            {
                "identifier": "draft-dashboard",
                "title": "Draft dashboard",
                "description": "Sketch charts",
                "owner": "Ece",
            }
        ],
    )

    started = platform.start_project_task("Analytics", "draft-dashboard", owner="Kerem")
    assert started.status.value == "in_progress"
    assert started.owner == "Kerem"

    platform.block_project_task("Analytics", "draft-dashboard", "Needs data source")
    project = platform.workspace._get_project("Analytics")
    task = project.task_board.get_task("draft-dashboard")
    assert task.status.value == "blocked"
    assert task.notes[-1] == "BLOCKED: Needs data source"

    completed = platform.complete_project_task("Analytics", "draft-dashboard")
    assert completed.status.value == "done"


# Kilometre taşı API'sinin platform üzerinden çalıştığını doğrular.
def test_platform_manages_milestones():
    platform = AppLabAgentPlatform()
    platform.create_project("Docs", "Belgeler", ["mkdocs"], tasks=[])

    milestone = platform.add_project_milestone(
        "Docs",
        title="İlk yayın",
        description="Beta dokümantasyonu yayınla",
        due_date="2024-10-20",
    )
    assert milestone.status == MilestoneStatus.PENDING

    platform.complete_project_milestone("Docs", "İlk yayın")
    upcoming = platform.upcoming_project_milestones(include_completed=True)
    assert upcoming[0]["status"] == MilestoneStatus.COMPLETED.value
    assert upcoming[0]["project"] == "Docs"


# Platformun proje çalışma alanını ön izleme için döndürebildiğini doğrular.
def test_platform_project_workspace_exposes_board_export():
    platform = AppLabAgentPlatform()
    platform.create_project(
        name="Preview",
        description="Ön izleme",
        tech_stack=["python"],
        tasks=[
            {
                "identifier": "outline",
                "title": "Taslak",
                "description": "İçeriği toparla",
                "owner": "Can",
            }
        ],
    )
    platform.start_project_task("Preview", "outline")

    workspace = platform.project_workspace("Preview")
    exported = workspace.board.export_tasks()
    assert exported[0]["identifier"] == "outline"
    assert exported[0]["status"] == TaskStatus.IN_PROGRESS.value


# Platform API'sinin geciken kilometre taşlarını raporladığını doğrular.
def test_platform_reports_overdue_milestones():
    platform = AppLabAgentPlatform()
    platform.create_project("Risk", "Risk izleme", ["python"], tasks=[])

    platform.add_project_milestone(
        "Risk",
        title="Uyarı altyapısı",
        description="Uyarı kurallarını oluştur",
        due_date="2024-01-04",
    )
    platform.add_project_milestone(
        "Risk",
        title="Sürüm planı",
        description="Yeni sprint planını hazırla",
        due_date="2024-01-09",
    )
    platform.add_project_milestone(
        "Risk",
        title="Rapor paylaşımı",
        description="Paydaşlara sunum yap",
        due_date="2024-01-02",
    )
    platform.complete_project_milestone("Risk", "Rapor paylaşımı")

    overdue = platform.overdue_project_milestones(reference_date="2024-01-08")
    assert [entry["milestone"] for entry in overdue] == ["Uyarı altyapısı"]

    overdue_with_completed = platform.overdue_project_milestones(
        reference_date="2024-01-08", include_completed=True
    )
    assert [entry["milestone"] for entry in overdue_with_completed] == [
        "Rapor paylaşımı",
        "Uyarı altyapısı",
    ]


# Platformun sorumlu bazlı görev raporunu sunduğunu doğrular.
def test_platform_lists_tasks_for_owner():
    platform = AppLabAgentPlatform()
    platform.create_project(
        name="Docs",
        description="Belgeleri güncelle",
        tech_stack=["mkdocs"],
        tasks=[
            {
                "identifier": "outline",
                "title": "İçerik taslağı",
                "description": "Başlıkları planla",
                "owner": "Leyla",
            },
            {
                "identifier": "review",
                "title": "Takım incelemesi",
                "description": "Geri bildirim topla",
                "owner": "leyla",
            },
            {
                "identifier": "publish",
                "title": "Yayınla",
                "description": "Siteyi dağıt",
            },
        ],
    )
    platform.create_project(
        name="Infra",
        description="Altyapı taşıması",
        tech_stack=["terraform"],
        tasks=[
            {
                "identifier": "migrate-db",
                "title": "Veritabanını taşı",
                "description": "Yeni kümeye geç",
                "owner": "Arda",
            }
        ],
    )

    platform.block_project_task("Docs", "review", "Eksik onay")
    platform.start_project_task("Docs", "outline")

    report = platform.list_tasks_for_owner("leyla")
    assert [entry["identifier"] for entry in report] == ["review", "outline"]
    assert report[0]["status"] == "blocked"
    assert report[1]["status"] == "in_progress"

    report_with_unassigned = platform.list_tasks_for_owner(
        "Leyla", include_unassigned=True
    )
    assert {entry["identifier"] for entry in report_with_unassigned} == {
        "review",
        "outline",
        "publish",
    }
    assert next(
        entry for entry in report_with_unassigned if entry["identifier"] == "publish"
    )["owner"] is None

    with pytest.raises(ProjectWorkspaceError):
        platform.list_tasks_for_owner("")


# Platformun sorumlu bazlı iş yükü özetini sunduğunu doğrular.
def test_platform_owner_workload_report_combines_projects():
    platform = AppLabAgentPlatform()
    platform.create_project(
        name="Docs",
        description="Belgeleri güncelle",
        tech_stack=["mkdocs"],
        tasks=[
            {
                "identifier": "outline",
                "title": "İçerik taslağı",
                "description": "Başlıkları planla",
                "owner": "Leyla",
            },
            {
                "identifier": "review",
                "title": "Takım incelemesi",
                "description": "Geri bildirim topla",
                "owner": "Arda",
            },
            {
                "identifier": "publish",
                "title": "Yayınla",
                "description": "Siteyi dağıt",
            },
        ],
    )
    platform.create_project(
        name="Infra",
        description="Altyapı taşıması",
        tech_stack=["terraform"],
        tasks=[
            {
                "identifier": "migrate-db",
                "title": "Veritabanını taşı",
                "description": "Yeni kümeye geç",
                "owner": "Leyla",
            }
        ],
    )

    platform.start_project_task("Docs", "outline")
    platform.block_project_task("Docs", "review", "Eksik onay")
    platform.complete_project_task("Infra", "migrate-db")

    summary = platform.owner_workload_report(include_unassigned=True)

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


# Entegrasyon denetiminin eksik hesap ve otomasyon boşluklarını raporladığını test eder.
def test_platform_integration_audit_flags_missing_links():
    platform = AppLabAgentPlatform()
    platform.link_account("aws", "prod", {"region": "eu-west-1"}, tags=["terraform", "cloud"])
    platform.link_account("snowflake", "warehouse", tags=["dbt"])

    platform.create_project(
        name="Data Mesh",
        description="Analitik veri platformu",
        tech_stack=["AWS", "dbt", "Airflow"],
        tasks=[],
    )
    platform.workspace.link_account_to_project("Data Mesh", "aws", "prod")

    platform.create_automation(
        name="Model Sync",
        trigger="schedule",
        actions=["dbt run"],
        required_accounts=["snowflake:warehouse"],
    )
    platform.assign_automation_to_project("Data Mesh", "Model Sync")

    project = platform.workspace._get_project("Data Mesh")
    project.automations.append("Legacy Flow")

    audit = platform.integration_audit()
    assert len(audit) == 1
    entry = audit[0]
    assert entry["project"] == "Data Mesh"
    assert entry["status"] == "needs_attention"
    assert "Airflow" in entry["missing_account_integrations"]
    assert "AWS" in entry["tech_coverage"]
    assert entry["tech_coverage"]["dbt"][0]["provider"] == "snowflake"
    assert any(gap["automation"] == "Legacy Flow" for gap in entry["automation_gaps"])
