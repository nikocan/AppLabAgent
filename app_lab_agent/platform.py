"""App Lab Agent platformunun üst düzey orkestrasyon bileşeni."""

from __future__ import annotations

from typing import Dict, Iterable, List, Mapping, Optional

from .accounts import AccountRegistry, AccountRegistryError, LinkedAccount
from .automation import AutomationRecipe, AutomationStudio
from .projects import Milestone, ProjectBlueprint, ProjectWorkspace
from .tasks import Task


# Platform seviyesindeki işlemler sırasında oluşabilecek hata türü.
class AppLabAgentError(RuntimeError):
    """Platform bileşenleri arasında koordinasyon yapılırken meydana gelen hatalar."""


# Tüm bileşenleri bir araya getirerek akıcı API sunan ana sınıf.
class AppLabAgentPlatform:
    """Hesap, proje ve otomasyon yönetimini tek noktadan yöneten yardımcı."""

    def __init__(self) -> None:
        self.accounts = AccountRegistry()
        self.workspace = ProjectWorkspace(self.accounts)
        self.automation_studio = AutomationStudio(self.accounts)

    # Platforma yeni hesap eklemeyi kolaylaştıran sarmalayıcı metot.
    def link_account(
        self,
        provider: str,
        name: str,
        metadata: Optional[Mapping[str, str]] = None,
        tags: Optional[Iterable[str]] = None,
    ) -> LinkedAccount:
        """Harici servis hesabını platforma kaydedip döndürür."""

        return self.accounts.register(provider, name, metadata=metadata, tags=tags)

    # Yeni proje ve görev panosu oluşturmak için kullanılan metot.
    def create_project(
        self,
        name: str,
        description: str,
        tech_stack: Iterable[str],
        goals: Optional[Iterable[str]] = None,
        tasks: Optional[Iterable[Mapping[str, str]]] = None,
    ) -> ProjectBlueprint:
        """Proje oluşturur, istenirse başlangıç görevlerini de ekler."""

        project = self.workspace.create_project(name, description, tech_stack, goals)
        if tasks:
            for task_definition in tasks:
                identifier = task_definition["identifier"]
                title = task_definition["title"]
                description_text = task_definition.get("description", "")
                owner = task_definition.get("owner")
                project.task_board.add_task(
                    Task(
                        identifier=identifier,
                        title=title,
                        description=description_text,
                        owner=owner,
                    )
                )
        return project

    # Ön izleme uç noktalarında proje çalışma alanını döndüren yardımcı metot.
    def project_workspace(self, name: str) -> ProjectBlueprint:
        """Projeyi blueprint halinde döndürerek görev panosuna erişim sağlar."""

        return self.workspace.project_workspace(name)

    # Otomasyon tariflerini oluşturmayı kolaylaştıran sarmalayıcı metot.
    def create_automation(
        self,
        name: str,
        trigger: str,
        actions: Iterable[str],
        required_accounts: Optional[Iterable[str]] = None,
        description: Optional[str] = None,
    ) -> AutomationRecipe:
        """Yeni otomasyon tarifini kaydedip döndürür."""

        return self.automation_studio.create_recipe(
            name=name,
            trigger=trigger,
            actions=actions,
            required_accounts=required_accounts,
            description=description,
        )

    # Proje görevlerini ilerletmek için kullanılan kısayol metotları.
    def start_project_task(
        self, project_name: str, identifier: str, owner: Optional[str] = None
    ) -> Task:
        """Belirtilen projedeki görevi başlatır ve isteğe bağlı sorumlu atar."""

        return self.workspace.start_task(project_name, identifier, owner)

    def complete_project_task(self, project_name: str, identifier: str) -> Task:
        """Projeye ait görevi tamamlandı olarak işaretler."""

        return self.workspace.complete_task(project_name, identifier)

    def block_project_task(self, project_name: str, identifier: str, reason: str) -> Task:
        """Projeye ait görevi bloklayıp açıklama notunu ekler."""

        return self.workspace.block_task(project_name, identifier, reason)

    # Belirli sorumluya atanan görevleri raporlayan metot.
    def list_tasks_for_owner(
        self, owner: str, include_unassigned: bool = False
    ) -> List[Mapping[str, object]]:
        """Çalışma alanındaki projelerden belirtilen sorumluya ait görevleri döndürür."""

        return self.workspace.tasks_for_owner(owner, include_unassigned=include_unassigned)

    # Platform çapında sorumluların iş yükünü raporlayan sarmalayıcı metot.
    def owner_workload_report(
        self, include_unassigned: bool = False
    ) -> List[Mapping[str, object]]:
        """Görev yükünü sorumlu bazında toplayıp platform düzeyinde döndürür."""

        return self.workspace.owner_workload(include_unassigned=include_unassigned)

    # Proje kilometre taşlarını yönetmek için sarmalayıcı metotlar.
    def add_project_milestone(
        self,
        project_name: str,
        title: str,
        description: str = "",
        due_date: Optional[str] = None,
    ) -> Milestone:
        """Projeye yeni kilometre taşı ekler ve sonucu döndürür."""

        return self.workspace.add_milestone(
            project_name, title, description=description, due_date=due_date
        )

    def complete_project_milestone(self, project_name: str, title: str) -> Milestone:
        """Projeye ait kilometre taşını tamamlandı olarak işaretler."""

        return self.workspace.complete_milestone(project_name, title)

    def upcoming_project_milestones(
        self, limit: Optional[int] = None, include_completed: bool = False
    ) -> List[Mapping[str, object]]:
        """Platform genelindeki kilometre taşlarını yaklaşan tarihe göre listeler."""

        return self.workspace.upcoming_milestones(
            limit=limit, include_completed=include_completed
        )

    # Proje kilometre taşlarının gecikme durumlarını raporlayan metot.
    def overdue_project_milestones(
        self,
        reference_date: Optional[str] = None,
        include_completed: bool = False,
    ) -> List[Mapping[str, object]]:
        """Teslim tarihi geçmiş kilometre taşlarını platform genelinde listeler."""

        return self.workspace.overdue_milestones(
            reference_date=reference_date, include_completed=include_completed
        )

    # Proje ve otomasyon bilgilerini derleyen raporlama metodu.
    def portfolio_overview(self) -> Mapping[str, object]:
        """Platformdaki projeler, hesaplar ve otomasyonlara dair özet çıkarır."""

        projects = [project.summary() for project in self.workspace.list_projects()]
        accounts = [account for account in self.accounts.list_accounts()]
        automations = [recipe.to_n8n_payload() for recipe in self.automation_studio.list_recipes()]
        return {
            "projects": projects,
            "accounts": [
                {
                    "provider": account.provider,
                    "name": account.name,
                    "metadata": dict(account.metadata),
                    "tags": list(account.tags),
                }
                for account in accounts
            ],
            "automations": automations,
        }

    # Bir projenin ihtiyaç duyduğu hesapların bağlanıp bağlanmadığını kontrol eden fonksiyon.
    def ensure_project_has_accounts(self, project_name: str, providers: Iterable[str]) -> None:
        """Projeye gerekli sağlayıcıların bağlandığından emin olur, eksik varsa hata atar."""

        project = self.workspace._get_project(project_name)
        missing = []
        for provider in providers:
            if not any(acc.provider.lower() == provider.lower() for acc in project.linked_accounts):
                missing.append(provider)
        if missing:
            raise AppLabAgentError(
                f"{project_name!r} projesinde eksik sağlayıcılar: {', '.join(missing)}"
            )

    # Proje ile otomasyonu ilişkilendirip görev atayan metot.
    def assign_automation_to_project(self, project_name: str, automation_name: str) -> Mapping[str, object]:
        """Projeye otomasyon bağlar, gerekli hesaplar yoksa hata üretir."""

        project = self.workspace._get_project(project_name)
        recipe = self.automation_studio._get(automation_name)
        self.automation_studio.validate_accounts(automation_name)
        for required in recipe.required_accounts:
            provider, _, name_fragment = required.partition(":")
            lookup_provider = provider or required
            lookup_name = name_fragment or required
            account = self.accounts.get(lookup_provider, lookup_name)
            if account not in project.linked_accounts:
                project.linked_accounts.append(account)
        if recipe.name not in project.automations:
            project.automations.append(recipe.name)
        # Otomasyonun devreye alınması için takip görevini oluşturuyoruz.
        automation_task = Task(
            identifier=f"automation::{recipe.name}",
            title=f"Otomasyon devreye alma - {recipe.name}",
            description=f"{recipe.trigger} tetikleyicili otomasyonu üretim ortamına taşı.",
        )
        try:
            project.task_board.add_task(automation_task)
        except ValueError:
            # Görev daha önce eklenmişse tekrar eklemeye gerek yok.
            pass
        return {
            "project": project.summary(),
            "automation": recipe.to_n8n_payload(),
        }

    # Platformdaki tüm verileri basit sözlük olarak dışa aktaran metot.
    def export_state(self) -> Mapping[str, object]:
        """Platform durumunu kolay yedeklenebilir sözlük formatında döndürür."""

        return {
            "accounts": self.accounts.to_dict(),
            "projects": [project.summary() for project in self.workspace.list_projects()],
            "automations": [recipe.to_n8n_payload() for recipe in self.automation_studio.list_recipes()],
        }

    # Proje teknoloji yığınları ile hesap/otomasyon entegrasyonlarını denetleyen rapor.
    def integration_audit(self) -> List[Mapping[str, object]]:
        """Teknoloji yığınlarına göre eksik hesap veya otomasyon bağlantılarını raporlar."""

        audit: List[Mapping[str, object]] = []
        automation_index: Dict[str, AutomationRecipe] = {
            recipe.name.lower(): recipe for recipe in self.automation_studio.list_recipes()
        }
        for project in self.workspace.list_projects():
            tech_stack = [entry.strip() for entry in project.tech_stack if entry.strip()]
            missing_accounts: List[str] = []
            tech_coverage: Dict[str, List[Mapping[str, object]]] = {}
            for tech in tech_stack:
                normalized = tech.lower()
                matches: List[Mapping[str, object]] = []
                for account in project.linked_accounts:
                    tags = {tag.lower() for tag in account.tags}
                    if account.provider.lower() == normalized or normalized in tags:
                        matches.append(
                            {
                                "provider": account.provider,
                                "name": account.name,
                                "metadata": dict(account.metadata),
                                "tags": list(account.tags),
                            }
                        )
                if matches:
                    tech_coverage[tech] = matches
                else:
                    missing_accounts.append(tech)

            automation_gaps: List[Mapping[str, object]] = []
            for automation_name in project.automations:
                recipe = automation_index.get(automation_name.lower())
                if not recipe:
                    automation_gaps.append(
                        {
                            "automation": automation_name,
                            "missing_accounts": [
                                "KAYITSIZ-OTOMASYON"
                            ],
                        }
                    )
                    continue
                missing_for_recipe: List[str] = []
                for required in recipe.required_accounts:
                    provider, _, name_fragment = required.partition(":")
                    lookup_provider = provider or required
                    lookup_name = name_fragment or required
                    try:
                        account = self.accounts.get(lookup_provider, lookup_name)
                    except AccountRegistryError:
                        missing_for_recipe.append(required)
                        continue
                    if account not in project.linked_accounts:
                        missing_for_recipe.append(f"{required} (proje bağlantısı yok)")
                if missing_for_recipe:
                    automation_gaps.append(
                        {
                            "automation": recipe.name,
                            "missing_accounts": missing_for_recipe,
                        }
                    )

            audit.append(
                {
                    "project": project.name,
                    "tech_stack": tech_stack,
                    "linked_accounts": [
                        {
                            "provider": account.provider,
                            "name": account.name,
                            "metadata": dict(account.metadata),
                            "tags": list(account.tags),
                        }
                        for account in project.linked_accounts
                    ],
                    "automations": list(project.automations),
                    "tech_coverage": tech_coverage,
                    "missing_account_integrations": missing_accounts,
                    "automation_gaps": automation_gaps,
                    "status": "ok"
                    if not missing_accounts and not automation_gaps
                    else "needs_attention",
                }
            )
        return audit
