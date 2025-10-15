"""Navigation menüsünün üretimi ve durum denetimlerini doğrulayan testler."""

from app_lab_agent import AppLabAgentPlatform


# Menü yapısının tüm bölümleri ile dolu biçimde üretildiğini doğrulayan test.
def test_navigation_menu_includes_platform_entities():
    platform = AppLabAgentPlatform()
    platform.link_account("github", "studio", metadata={"plan": "team"}, tags=["ci"])
    project = platform.create_project(
        name="Portal",
        description="Geliştirici portalı",
        tech_stack=["python"],
        tasks=[
            {
                "identifier": "draft-docs",
                "title": "Doküman taslağını hazırla",
                "description": "Başlangıç rehberini yaz",
            }
        ],
    )
    platform.create_automation(
        name="Deploy pipeline",
        trigger="pull_request",
        actions=["lint", "deploy"],
        required_accounts=["github:studio"],
        description="PR açıldığında devreye giren otomasyon",
    )
    platform.start_project_task(project.name, "draft-docs", owner="Ayşe")
    platform.complete_project_task(project.name, "draft-docs")

    menu = platform.navigation_menu()

    assert menu["missing_sections"] == []
    sections = {section["identifier"]: section for section in menu["sections"]}
    assert set(sections) == {"overview", "accounts", "projects", "automations"}

    account_entry = sections["accounts"]["items"][0]
    assert account_entry["route"] == "/accounts/github/studio"
    assert account_entry["badge"] == "1 etiket"

    project_entry = sections["projects"]["items"][0]
    assert project_entry["badge"] == "1/1"
    assert project_entry["route"] == "/projects/portal"

    automation_entry = sections["automations"]["items"][0]
    assert automation_entry["badge"] == "2 adım"
    assert automation_entry["route"] == "/automations/deploy-pipeline"

    overview_item = sections["overview"]["items"][0]
    assert overview_item["badge"] == "1"


# Menüde veri olmadığında boş bölümlerin işaretlendiğini doğrulayan test.
def test_navigation_menu_flags_empty_sections_without_records():
    platform = AppLabAgentPlatform()

    menu = platform.navigation_menu()

    assert menu["missing_sections"] == []
    assert set(menu["empty_sections"]) == {"accounts", "projects", "automations"}

    sections = {section["identifier"]: section for section in menu["sections"]}
    assert sections["overview"]["items"][0]["badge"] == "0"
    assert sections["accounts"]["items"] == []
