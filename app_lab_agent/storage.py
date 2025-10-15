"""Platform durumunu serileştirmek ve geri yüklemek için veri şemaları sağlar."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Mapping, Optional

from .accounts import AccountRegistry, LinkedAccount
from .automation import AutomationRecipe, AutomationStudio, AutomationValidationError
from .platform import AppLabAgentPlatform
from .projects import (
    Milestone,
    MilestoneStatus,
    ProjectBlueprint,
    ProjectWorkspace,
    ProjectWorkspaceError,
)
from .tasks import Task, TaskStatus


# Hesap kayıtlarını serileştirmek için kullanılan veri sınıfı.
@dataclass
class AccountRecord:
    """Hesap bilgisini depolamak için kullanılan temel yapı."""

    provider: str
    name: str
    metadata: Dict[str, str] = field(default_factory=dict)
    tags: List[str] = field(default_factory=list)

    # LinkedAccount nesnesinden kayıt üretmeye yarayan yardımcı fonksiyon.
    @classmethod
    def from_linked_account(cls, account: LinkedAccount) -> "AccountRecord":
        """Var olan bağlı hesabı serileştirilmiş kayıt formatına dönüştürür."""

        return cls(
            provider=account.provider,
            name=account.name,
            metadata=dict(account.metadata),
            tags=list(account.tags),
        )

    # Kayıttan LinkedAccount nesnesi oluşturan yardımcı fonksiyon.
    def to_linked_account(self) -> LinkedAccount:
        """Serileştirilmiş kaydı LinkedAccount nesnesine çevirir."""

        return LinkedAccount(
            provider=self.provider,
            name=self.name,
            metadata=dict(self.metadata),
            tags=tuple(self.tags),
        )

    # Sözlük formatında çıktı üreten metot.
    def to_dict(self) -> Dict[str, object]:
        """Kayıt bilgisini JSON uyumlu sözlük olarak döndürür."""

        return {
            "provider": self.provider,
            "name": self.name,
            "metadata": dict(self.metadata),
            "tags": list(self.tags),
        }

    # Sözlükten kayıt üreten sınıf metodu.
    @classmethod
    def from_dict(cls, data: Mapping[str, object]) -> "AccountRecord":
        """Sözlük bilgisinden kayıt nesnesi oluşturur."""

        return cls(
            provider=str(data["provider"]),
            name=str(data["name"]),
            metadata=dict(data.get("metadata", {})),
            tags=list(data.get("tags", [])),
        )


# Görev kayıtlarını saklayan veri sınıfı.
@dataclass
class TaskRecord:
    """Görev detaylarını kalıcı formata taşıyan yapı."""

    identifier: str
    title: str
    description: str
    status: str = TaskStatus.PENDING.value
    owner: Optional[str] = None
    notes: List[str] = field(default_factory=list)

    # Task nesnesinden kayıt üretmeye yarayan yardımcı fonksiyon.
    @classmethod
    def from_task(cls, task: Task) -> "TaskRecord":
        """Görevi serileştirilebilir kayıt biçimine çevirir."""

        return cls(
            identifier=task.identifier,
            title=task.title,
            description=task.description,
            status=task.status.value,
            owner=task.owner,
            notes=list(task.notes),
        )

    # Kayıttan Task nesnesi oluşturan yardımcı metot.
    def to_task(self) -> Task:
        """Serileştirilmiş görev kaydını Task nesnesine dönüştürür."""

        task = Task(
            identifier=self.identifier,
            title=self.title,
            description=self.description,
            owner=self.owner,
        )
        task.status = TaskStatus(self.status)
        task.notes = list(self.notes)
        return task

    # Sözlük formatında çıktı sağlayan metot.
    def to_dict(self) -> Dict[str, object]:
        """Görev kaydını JSON uyumlu sözlük olarak döndürür."""

        return {
            "identifier": self.identifier,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "owner": self.owner,
            "notes": list(self.notes),
        }

    # Sözlükten kayıt oluşturan sınıf metodu.
    @classmethod
    def from_dict(cls, data: Mapping[str, object]) -> "TaskRecord":
        """Sözlük bilgisinden görev kaydı üretir."""

        return cls(
            identifier=str(data["identifier"]),
            title=str(data["title"]),
            description=str(data.get("description", "")),
            status=str(data.get("status", TaskStatus.PENDING.value)),
            owner=data.get("owner"),
            notes=list(data.get("notes", [])),
        )


# Kilometre taşı kayıtlarını saklayan veri sınıfı.
@dataclass
class MilestoneRecord:
    """Kilometre taşı ayrıntılarını kalıcı formata dönüştüren yapı."""

    title: str
    description: str = ""
    due_date: Optional[str] = None
    status: str = MilestoneStatus.PENDING.value

    # Milestone nesnesinden kayıt üretmeye yarayan yardımcı fonksiyon.
    @classmethod
    def from_milestone(cls, milestone: Milestone) -> "MilestoneRecord":
        """Kilometre taşını serileştirilebilir kayıt formatına çevirir."""

        return cls(
            title=milestone.title,
            description=milestone.description,
            due_date=milestone.due_date,
            status=milestone.status.value,
        )

    # Kayıttan Milestone nesnesi oluşturan yardımcı metot.
    def to_milestone(self) -> Milestone:
        """Serileştirilmiş kilometre taşını Milestone nesnesine dönüştürür."""

        milestone = Milestone(
            title=self.title,
            description=self.description,
            due_date=self.due_date,
        )
        milestone.status = MilestoneStatus(self.status)
        return milestone

    # Sözlük formatında çıktı sağlayan metot.
    def to_dict(self) -> Dict[str, object]:
        """Kilometre taşı kaydını JSON uyumlu sözlük olarak döndürür."""

        return {
            "title": self.title,
            "description": self.description,
            "due_date": self.due_date,
            "status": self.status,
        }

    # Sözlükten kayıt oluşturan sınıf metodu.
    @classmethod
    def from_dict(cls, data: Mapping[str, object]) -> "MilestoneRecord":
        """Sözlük bilgisinden kilometre taşı kaydı üretir."""

        return cls(
            title=str(data["title"]),
            description=str(data.get("description", "")),
            due_date=data.get("due_date"),
            status=str(data.get("status", MilestoneStatus.PENDING.value)),
        )


# Proje kayıtlarını saklayan veri sınıfı.
@dataclass
class ProjectRecord:
    """Projeye ait görev ve hesap referanslarını içeren serileştirme yapısı."""

    name: str
    description: str
    tech_stack: List[str] = field(default_factory=list)
    goals: List[str] = field(default_factory=list)
    tasks: List[TaskRecord] = field(default_factory=list)
    linked_accounts: List[str] = field(default_factory=list)
    milestones: List[MilestoneRecord] = field(default_factory=list)
    automations: List[str] = field(default_factory=list)

    # ProjectBlueprint nesnesinden kayıt üretir.
    @classmethod
    def from_project(cls, project: ProjectBlueprint) -> "ProjectRecord":
        """Proje çalışma alanındaki blueprint'i serileştirilebilir kayda dönüştürür."""

        tasks = [TaskRecord.from_task(task) for task in project.task_board.list_by_status()]
        milestones = [MilestoneRecord.from_milestone(item) for item in project.milestones]
        linked = [f"{account.provider}:{account.name}" for account in project.linked_accounts]
        return cls(
            name=project.name,
            description=project.description,
            tech_stack=list(project.tech_stack),
            goals=list(project.goals),
            tasks=tasks,
            milestones=milestones,
            linked_accounts=linked,
            automations=list(project.automations),
        )

    # Kayıt bilgisini çalışma alanına uygular.
    def apply(self, workspace: ProjectWorkspace, registry: AccountRegistry) -> ProjectBlueprint:
        """Kayıttaki projeyi çalışma alanına yeniden kurar."""

        blueprint = workspace.create_project(
            name=self.name,
            description=self.description,
            tech_stack=self.tech_stack,
            goals=self.goals,
        )
        for task_record in self.tasks:
            task = task_record.to_task()
            # Görev kimliği benzersiz olmalı, mevcutsa güncelliyoruz.
            try:
                blueprint.task_board.add_task(task)
            except ValueError:
                existing = blueprint.task_board.get_task(task.identifier)
                existing.title = task.title
                existing.description = task.description
                existing.status = task.status
                existing.owner = task.owner
                existing.notes = list(task.notes)
        for milestone_record in self.milestones:
            milestone = milestone_record.to_milestone()
            try:
                blueprint.add_milestone(milestone)
            except ProjectWorkspaceError:
                existing = blueprint.get_milestone(milestone.title)
                existing.description = milestone.description
                existing.due_date = milestone.due_date
                existing.status = milestone.status
        for reference in self.linked_accounts:
            provider, _, name_fragment = reference.partition(":")
            account = registry.get(provider, name_fragment or provider)
            if account not in blueprint.linked_accounts:
                blueprint.linked_accounts.append(account)
        for automation in self.automations:
            if automation not in blueprint.automations:
                blueprint.automations.append(automation)
        return blueprint

    # Sözlük olarak çıktı üretir.
    def to_dict(self) -> Dict[str, object]:
        """Projeyi JSON uyumlu sözlük formatına dönüştürür."""

        return {
            "name": self.name,
            "description": self.description,
            "tech_stack": list(self.tech_stack),
            "goals": list(self.goals),
            "tasks": [task.to_dict() for task in self.tasks],
            "milestones": [milestone.to_dict() for milestone in self.milestones],
            "linked_accounts": list(self.linked_accounts),
            "automations": list(self.automations),
        }

    # Sözlükten kayıt oluşturur.
    @classmethod
    def from_dict(cls, data: Mapping[str, object]) -> "ProjectRecord":
        """Sözlük bilgisinden proje kaydı üretir."""

        return cls(
            name=str(data["name"]),
            description=str(data.get("description", "")),
            tech_stack=list(data.get("tech_stack", [])),
            goals=list(data.get("goals", [])),
            tasks=[TaskRecord.from_dict(entry) for entry in data.get("tasks", [])],
            milestones=[
                MilestoneRecord.from_dict(entry) for entry in data.get("milestones", [])
            ],
            linked_accounts=list(data.get("linked_accounts", [])),
            automations=list(data.get("automations", [])),
        )


# Otomasyon kayıtlarını serileştiren veri sınıfı.
@dataclass
class AutomationRecord:
    """Otomasyon tariflerini kalıcı forma taşıyan yapı."""

    name: str
    trigger: str
    actions: List[str] = field(default_factory=list)
    required_accounts: List[str] = field(default_factory=list)
    description: Optional[str] = None

    # AutomationRecipe nesnesinden kayıt üretir.
    @classmethod
    def from_recipe(cls, recipe: AutomationRecipe) -> "AutomationRecord":
        """Otomasyon tarifini serileştirilebilir kayda çevirir."""

        return cls(
            name=recipe.name,
            trigger=recipe.trigger,
            actions=list(recipe.actions),
            required_accounts=list(recipe.required_accounts),
            description=recipe.description,
        )

    # Kayıt bilgisini otomasyon stüdyosuna uygular.
    def apply(self, studio: AutomationStudio) -> AutomationRecipe:
        """Kayıtlı tarifi otomasyon stüdyosuna yeniden ekler."""

        try:
            recipe = studio.create_recipe(
                name=self.name,
                trigger=self.trigger,
                actions=self.actions,
                required_accounts=self.required_accounts,
                description=self.description,
            )
        except AutomationValidationError:
            recipe = studio._get(self.name)
            recipe.trigger = self.trigger
            recipe.actions = list(self.actions)
            recipe.required_accounts = list(self.required_accounts)
            recipe.description = self.description
        return recipe

    # Sözlük formatı dönüşümü.
    def to_dict(self) -> Dict[str, object]:
        """Otomasyon kaydını JSON uyumlu sözlük olarak döndürür."""

        return {
            "name": self.name,
            "trigger": self.trigger,
            "actions": list(self.actions),
            "required_accounts": list(self.required_accounts),
            "description": self.description,
        }

    # Sözlükten kayıt üreten sınıf metodu.
    @classmethod
    def from_dict(cls, data: Mapping[str, object]) -> "AutomationRecord":
        """Sözlük bilgisinden otomasyon kaydı oluşturur."""

        return cls(
            name=str(data["name"]),
            trigger=str(data.get("trigger", "")),
            actions=list(data.get("actions", [])),
            required_accounts=list(data.get("required_accounts", [])),
            description=data.get("description"),
        )


# Platformdaki tüm verileri kapsayan üst düzey şema sınıfı.
@dataclass
class DatabaseSchema:
    """Hesap, proje ve otomasyon verilerini kapsayan serileştirme şeması."""

    accounts: List[AccountRecord] = field(default_factory=list)
    projects: List[ProjectRecord] = field(default_factory=list)
    automations: List[AutomationRecord] = field(default_factory=list)

    # Platformdaki güncel durumdan şema üreten yardımcı fonksiyon.
    @classmethod
    def from_platform(cls, platform: AppLabAgentPlatform) -> "DatabaseSchema":
        """Verilen platform örneğindeki durumu serileştirilebilir şemaya dönüştürür."""

        accounts = [AccountRecord.from_linked_account(acc) for acc in platform.accounts.list_accounts()]
        projects = [ProjectRecord.from_project(project) for project in platform.workspace.list_projects()]
        automations = [AutomationRecord.from_recipe(recipe) for recipe in platform.automation_studio.list_recipes()]
        return cls(accounts=accounts, projects=projects, automations=automations)

    # Şemayı yeni bir platform örneğine uygular.
    def to_platform(self) -> AppLabAgentPlatform:
        """Serileştirilmiş durumdan yeni bir platform örneği oluşturur."""

        platform = AppLabAgentPlatform()
        self.apply_to_platform(platform)
        return platform

    # Şemanın var olan platforma uygulanmasını sağlayan metot.
    def apply_to_platform(self, platform: AppLabAgentPlatform) -> None:
        """Şemadaki verileri var olan platform örneğine yükler."""

        for account_record in self.accounts:
            try:
                platform.accounts.register(
                    account_record.provider,
                    account_record.name,
                    metadata=account_record.metadata,
                    tags=account_record.tags,
                )
            except Exception:
                # Kayıt mevcutsa meta veriyi güncelliyoruz.
                platform.accounts.update_metadata(
                    account_record.provider,
                    account_record.name,
                    **account_record.metadata,
                )
        for project_record in self.projects:
            project_record.apply(platform.workspace, platform.accounts)
        for automation_record in self.automations:
            automation_record.apply(platform.automation_studio)

    # Şemayı sözlük formatına çeviren metot.
    def to_dict(self) -> Dict[str, object]:
        """Şema verisini JSON uyumlu sözlük olarak döndürür."""

        return {
            "accounts": [record.to_dict() for record in self.accounts],
            "projects": [record.to_dict() for record in self.projects],
            "automations": [record.to_dict() for record in self.automations],
        }

    # Sözlükten şema oluşturan sınıf metodu.
    @classmethod
    def from_dict(cls, data: Mapping[str, object]) -> "DatabaseSchema":
        """Sözlük yapısından şema nesnesi üretir."""

        return cls(
            accounts=[AccountRecord.from_dict(entry) for entry in data.get("accounts", [])],
            projects=[ProjectRecord.from_dict(entry) for entry in data.get("projects", [])],
            automations=[AutomationRecord.from_dict(entry) for entry in data.get("automations", [])],
        )
