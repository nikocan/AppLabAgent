"""DatabaseSchema yardımları için senaryoları doğrulayan testler."""

from app_lab_agent import AppLabAgentPlatform, MilestoneStatus, TaskStatus
from app_lab_agent.storage import DatabaseSchema


def build_sample_platform() -> AppLabAgentPlatform:
    """Test senaryolarında kullanılan örnek platformu hazırlar."""

    platform = AppLabAgentPlatform()
    platform.link_account("github", "studio", {"plan": "team"}, tags=["source"])
    platform.link_account("slack", "alerts", {"channel": "#alerts"})
    project = platform.create_project(
        name="Deploy bot",
        description="Otomasyon platformu için CI/CD botu",
        tech_stack=["python", "n8n"],
        goals=["MVP", "Canary release"],
        tasks=[
            {
                "identifier": "plan",
                "title": "Planlama",
                "description": "İş gereksinimlerini topla",
                "owner": "ayse",
            },
            {
                "identifier": "build",
                "title": "CI pipeline",
                "description": "Test ve build adımlarını oluştur",
                "owner": "veli",
            },
        ],
    )
    platform.add_project_milestone(
        "Deploy bot",
        title="Canary yayını",
        description="İlk canary dağıtımını yap",
        due_date="2024-11-30",
    )
    platform.complete_project_milestone("Deploy bot", "Canary yayını")
    project.task_board.mark_in_progress("plan", owner="ayse")
    project.task_board.mark_done("plan")
    project.task_board.block_task("build", "Onay bekleniyor")
    project.task_board.get_task("build").notes.append("Test notu")
    platform.workspace.link_account_to_project("Deploy bot", "github", "studio")
    platform.create_automation(
        name="Deploy",
        trigger="pull_request",
        actions=["lint", "deploy"],
        required_accounts=["github:studio", "slack:alerts"],
        description="PR açılınca otomatik dağıtım",
    )
    platform.assign_automation_to_project("Deploy bot", "Deploy")
    return platform


def test_schema_roundtrip_preserves_data():
    """Platformdan alınan şema sözlüğe ve tekrar platforma geri dönerken veri kaybı olmaz."""

    platform = build_sample_platform()
    schema = DatabaseSchema.from_platform(platform)

    serialised = schema.to_dict()
    restored_schema = DatabaseSchema.from_dict(serialised)
    restored_platform = restored_schema.to_platform()

    restored_accounts = restored_platform.accounts.list_accounts()
    assert {(acc.provider, acc.name) for acc in restored_accounts} == {
        ("github", "studio"),
        ("slack", "alerts"),
    }

    restored_project = restored_platform.workspace.list_projects()[0]
    assert restored_project.summary()["progress"]["done"] == 1
    build_task = restored_project.task_board.get_task("build")
    assert build_task.status is TaskStatus.BLOCKED
    assert "Test notu" in build_task.notes
    milestone = restored_project.get_milestone("Canary yayını")
    assert milestone.status is MilestoneStatus.COMPLETED

    restored_recipe = restored_platform.automation_studio.list_recipes()[0]
    assert restored_recipe.name == "Deploy"
    assert set(restored_recipe.required_accounts) == {"github:studio", "slack:alerts"}


def test_schema_apply_updates_existing_platform():
    """Şema, mevcut platforma uygulandığında meta verileri güncelleyebilir."""

    platform = AppLabAgentPlatform()
    platform.link_account("github", "studio", {"plan": "free"})

    baseline_schema = DatabaseSchema.from_platform(platform)
    baseline_schema.accounts[0].metadata["plan"] = "team"
    baseline_schema.apply_to_platform(platform)

    updated_account = platform.accounts.get("github", "studio")
    assert updated_account.metadata["plan"] == "team"
