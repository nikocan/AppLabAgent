"""App Lab Agent projelerini planlamaya ve yönetmeye odaklı bileşenler."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, date
from enum import Enum
from typing import Dict, Iterable, List, Mapping, Optional

from .accounts import AccountRegistry, LinkedAccount
from .tasks import Task, TaskBoard, TaskStatus


# Proje çalışma alanlarında kullanılan hata türü.
class ProjectWorkspaceError(RuntimeError):
    """Projeler üzerinde çalışırken oluşan hataları temsil eder."""


# Proje düzeyindeki özet bilgiyi taşıyan veri sınıfı.
@dataclass
class ProjectBlueprint:
    """Bir projenin temel yapı taşlarını ve referanslarını saklar."""

    name: str
    description: str
    tech_stack: List[str]
    goals: List[str]
    task_board: TaskBoard = field(default_factory=TaskBoard)
    linked_accounts: List[LinkedAccount] = field(default_factory=list)
    milestones: List["Milestone"] = field(default_factory=list)
    # Projenin bağlı otomasyon adlarını saklayan liste.
    automations: List[str] = field(default_factory=list)

    # UI ön izlemelerinde görev panosuna ulaşmayı kolaylaştıran özellik.
    @property
    def board(self) -> TaskBoard:
        """Görev panosu referansını frontendlere aktarır."""

        return self.task_board

    # Proje için kısa özet çıkaran yardımcı fonksiyon.
    def summary(self) -> Mapping[str, object]:
        """Projeye ait temel istatistikleri sözlük formatında döndürür."""

        progress = self.task_board.progress_report()
        progress["tasks"] = [
            {
                "identifier": task.identifier,
                "title": task.title,
                "status": task.status.value,
                "owner": task.owner,
            }
            for task in self.task_board.list_by_status()
        ]
        progress["milestones"] = [milestone.to_summary() for milestone in self.milestones]
        progress["automations"] = list(self.automations)
        return {
            "name": self.name,
            "description": self.description,
            "tech_stack": list(self.tech_stack),
            "goals": list(self.goals),
            "linked_accounts": [account.name for account in self.linked_accounts],
            "automations": list(self.automations),
            "progress": progress,
        }

    # Projeye yeni hedef eklemeyi sağlayan yardımcı metot.
    def add_goal(self, goal: str) -> None:
        """Proje hedefleri listesine yeni hedef ekler."""

        if goal not in self.goals:
            self.goals.append(goal)

    # Proje yol haritasında kullanılan kilometre taşlarını saklayan yardımcı metot.
    def add_milestone(self, milestone: "Milestone") -> None:
        """Yeni kilometre taşını proje kaydına ekler."""

        if any(existing.title == milestone.title for existing in self.milestones):
            raise ProjectWorkspaceError(
                f"{milestone.title!r} adlı kilometre taşı zaten mevcut."
            )
        self.milestones.append(milestone)

    # Proje içindeki kilometre taşlarını durum bazlı arayan metot.
    def list_milestones(self, status: Optional["MilestoneStatus"] = None) -> List["Milestone"]:
        """Kilometre taşlarını filtreleyerek döndürür."""

        if status is None:
            return list(self.milestones)
        return [milestone for milestone in self.milestones if milestone.status == status]

    # Projede belirli bir kilometre taşını bulan yardımcı metot.
    def get_milestone(self, title: str) -> "Milestone":
        """Başlığa göre kilometre taşını bulur, yoksa hata üretir."""

        for milestone in self.milestones:
            if milestone.title == title:
                return milestone
        raise ProjectWorkspaceError(f"{title!r} başlıklı kilometre taşı bulunamadı.")


# Birden fazla projeyi organize eden çalışma alanı sınıfı.
class ProjectWorkspace:
    """Projeleri oluşturan, yöneten ve raporlayan ana konteyner."""

    def __init__(self, account_registry: Optional[AccountRegistry] = None) -> None:
        self._projects: Dict[str, ProjectBlueprint] = {}
        self._accounts = account_registry or AccountRegistry()

    # Yeni proje oluşturan ana yardımcı metot.
    def create_project(
        self,
        name: str,
        description: str,
        tech_stack: Iterable[str],
        goals: Optional[Iterable[str]] = None,
    ) -> ProjectBlueprint:
        """Yeni proje oluşturur ve çalışma alanına ekler."""

        slug = self._slugify(name)
        if slug in self._projects:
            raise ProjectWorkspaceError(f"{name!r} adına sahip proje zaten var.")

        project = ProjectBlueprint(
            name=name,
            description=description,
            tech_stack=list(tech_stack),
            goals=list(goals or []),
        )
        self._projects[slug] = project
        return project

    # Proje silmeyi sağlayan yardımcı metot.
    def delete_project(self, name: str) -> ProjectBlueprint:
        """Projeyi isim üzerinden kaldırır ve kaldırılan örneği döndürür."""

        slug = self._slugify(name)
        try:
            return self._projects.pop(slug)
        except KeyError as exc:
            raise ProjectWorkspaceError(f"{name!r} isimli proje bulunamadı.") from exc

    # Çalışma alanındaki projeleri listeleyen metot.
    def list_projects(self) -> List[ProjectBlueprint]:
        """Tüm projeleri oluşturulma sırasına göre döndürür."""

        return list(self._projects.values())

    # Ön izleme ve servis katmanları için proje kaydını döndüren yardımcı metot.
    def project_workspace(self, name: str) -> ProjectBlueprint:
        """Projeye ait blueprint'i doğrudan erişim için döndürür."""

        return self._get_project(name)

    # Projeye görev ekleme sürecini kolaylaştıran metot.
    def add_task_to_project(
        self,
        project_name: str,
        identifier: str,
        title: str,
        description: str,
        owner: Optional[str] = None,
    ) -> Task:
        """Belirtilen projeye yeni görev ekler ve görevi döndürür."""

        project = self._get_project(project_name)
        task = Task(identifier=identifier, title=title, description=description, owner=owner)
        project.task_board.add_task(task)
        return task

    # Projedeki görevi başlatıp ilerleme durumunu güncelleyen metot.
    def start_task(self, project_name: str, identifier: str, owner: Optional[str] = None) -> Task:
        """Görevi 'in_progress' durumuna çeker ve isteğe göre sorumlu atar."""

        project = self._get_project(project_name)
        return project.task_board.mark_in_progress(identifier, owner)

    # Projede tamamlanan görevi işaretleyen metot.
    def complete_task(self, project_name: str, identifier: str) -> Task:
        """Görevi 'done' durumuna taşıyarak tamamlandığını kaydeder."""

        project = self._get_project(project_name)
        return project.task_board.mark_done(identifier)

    # Görevi bloklayıp açıklama ekleyen yardımcı metot.
    def block_task(self, project_name: str, identifier: str, reason: str) -> Task:
        """Görevi 'blocked' durumuna getirir ve sebep notunu ekler."""

        project = self._get_project(project_name)
        return project.task_board.block_task(identifier, reason)

    # Projede kullanılacak hesabı ilişkilendiren yardımcı metot.
    def link_account_to_project(self, project_name: str, provider: str, account_name: str) -> LinkedAccount:
        """Kayıtlı bir hesabı projeye bağlar ve referansını döndürür."""

        project = self._get_project(project_name)
        account = self._accounts.get(provider, account_name)
        if account not in project.linked_accounts:
            project.linked_accounts.append(account)
        return account

    # Projeye yeni kilometre taşı ekleyen yardımcı metot.
    def add_milestone(
        self,
        project_name: str,
        title: str,
        description: str = "",
        due_date: Optional[str] = None,
    ) -> "Milestone":
        """Belirtilen projeye kilometre taşı ekler."""

        project = self._get_project(project_name)
        milestone = Milestone(title=title, description=description, due_date=due_date)
        project.add_milestone(milestone)
        return milestone

    # Projedeki kilometre taşını tamamlanmış olarak işaretleyen metot.
    def complete_milestone(self, project_name: str, title: str) -> "Milestone":
        """Kilometre taşını tamamlandı durumuna getirir."""

        project = self._get_project(project_name)
        milestone = project.get_milestone(title)
        milestone.complete()
        return milestone

    # Çalışma alanında yaklaşan kilometre taşlarını raporlayan metot.
    def upcoming_milestones(
        self, limit: Optional[int] = None, include_completed: bool = False
    ) -> List[Mapping[str, object]]:
        """Projelerde yaklaşan kilometre taşlarını son teslim tarihine göre sıralar."""

        collected: List[Mapping[str, object]] = []
        for project in self._projects.values():
            for milestone in project.milestones:
                if not include_completed and milestone.status == MilestoneStatus.COMPLETED:
                    continue
                collected.append(
                    {
                        "project": project.name,
                        "milestone": milestone.title,
                        "due_date": milestone.due_date,
                        "status": milestone.status.value,
                    }
                )

        def _sort_key(entry: Mapping[str, object]) -> tuple:
            due = entry.get("due_date")
            if not due:
                return (datetime.max, entry["project"], entry["milestone"])
            try:
                return (datetime.fromisoformat(str(due)), entry["project"], entry["milestone"])
            except ValueError:
                return (datetime.max, entry["project"], entry["milestone"])

        collected.sort(key=_sort_key)
        if limit is not None:
            return collected[:limit]
        return collected

    # Teslim tarihi geçmiş kilometre taşlarını raporlayan metot.
    def overdue_milestones(
        self,
        reference_date: Optional[str] = None,
        include_completed: bool = False,
    ) -> List[Mapping[str, object]]:
        """Teslim tarihi referans tarihten önce olan kilometre taşlarını listeler."""

        if reference_date is None:
            reference = datetime.utcnow().date()
        else:
            try:
                reference = datetime.fromisoformat(reference_date).date()
            except ValueError as exc:
                raise ProjectWorkspaceError(
                    "Referans tarihi ISO formatında olmalıdır."
                ) from exc

        overdue_entries: List[tuple[date, Mapping[str, object]]] = []
        for project in self._projects.values():
            for milestone in project.milestones:
                if not include_completed and milestone.status == MilestoneStatus.COMPLETED:
                    continue
                if milestone.due_date is None:
                    continue
                try:
                    due_date_value = datetime.fromisoformat(milestone.due_date).date()
                except ValueError:
                    # Geçersiz tarihler raporlanmaz.
                    continue
                if due_date_value >= reference:
                    continue
                overdue_entries.append(
                    (
                        due_date_value,
                        {
                            "project": project.name,
                            "milestone": milestone.title,
                            "due_date": milestone.due_date,
                            "status": milestone.status.value,
                        },
                    )
                )

        overdue_entries.sort(key=lambda entry: (entry[0], entry[1]["project"], entry[1]["milestone"]))
        return [entry[1] for entry in overdue_entries]

    # Belirli sağlayıcıya ihtiyaç duyan projeleri filtreleyen metot.
    def find_projects_needing_account(self, provider: str) -> List[ProjectBlueprint]:
        """Belirtilen sağlayıcıya henüz bağlanmamış projeleri döndürür."""

        provider_key = provider.lower()
        result = []
        for project in self._projects.values():
            if not any(acc.provider.lower() == provider_key for acc in project.linked_accounts):
                result.append(project)
        return result

    # Proje ilerlemesini durum bazında özetleyen metot.
    def status_overview(self) -> Mapping[str, Mapping[str, int]]:
        """Projelerdeki görev durumlarını toplu olarak raporlar."""

        overview: Dict[str, Dict[str, int]] = {}
        for project in self._projects.values():
            counts = {status.value: 0 for status in TaskStatus}
            for task in project.task_board.list_by_status():
                counts[task.status.value] += 1
            overview[project.name] = counts
        return overview

    # Belirli bir sahibin sorumluluğundaki görevleri proje bazında toplayan metot.
    def tasks_for_owner(
        self, owner: str, include_unassigned: bool = False
    ) -> List[Mapping[str, object]]:
        """Sorumlu adına göre görevleri sıralayıp proje, durum ve not bilgileriyle döndürür."""

        if not owner or not owner.strip():
            raise ProjectWorkspaceError("Sorumlu adı boş bırakılamaz.")

        collected: List[Mapping[str, object]] = []
        for project in self._projects.values():
            for task in project.task_board.list_by_owner(
                owner, include_unassigned=include_unassigned
            ):
                collected.append(
                    {
                        "project": project.name,
                        "identifier": task.identifier,
                        "title": task.title,
                        "status": task.status.value,
                        "owner": task.owner,
                        "notes": list(task.notes),
                    }
                )

        status_priority = {
            TaskStatus.BLOCKED.value: 0,
            TaskStatus.IN_PROGRESS.value: 1,
            TaskStatus.PENDING.value: 2,
            TaskStatus.DONE.value: 3,
        }

        def _sort_key(entry: Mapping[str, object]) -> tuple:
            return (
                status_priority.get(entry["status"], 99),
                entry["project"],
                entry["identifier"],
            )

        collected.sort(key=_sort_key)
        return collected

    # Sorumlu bazlı iş yükünü projeler arasında toplayan yardımcı metot.
    def owner_workload(
        self, include_unassigned: bool = False
    ) -> List[Mapping[str, object]]:
        """Projelerdeki görev yükünü sorumlu başına toplayıp döndürür."""

        aggregated: Dict[str, Dict[str, object]] = {}
        for project in self._projects.values():
            for entry in project.task_board.workload_by_owner(
                include_unassigned=include_unassigned
            ):
                owner_key = entry["normalized_owner"]
                bucket = aggregated.setdefault(
                    owner_key,
                    {
                        "owner": entry["owner"],
                        "normalized_owner": owner_key,
                        "total": 0,
                        "status_breakdown": {status.value: 0 for status in TaskStatus},
                        "projects": [],
                    },
                )

                if bucket["owner"] is None and entry["owner"] is not None:
                    bucket["owner"] = entry["owner"]

                bucket["total"] += entry["total"]
                for status, count in entry["status_breakdown"].items():
                    bucket["status_breakdown"][status] += count

                bucket["projects"].append(
                    {
                        "project": project.name,
                        "tasks": entry["tasks"],
                    }
                )

        return sorted(
            aggregated.values(),
            key=lambda item: (
                -item["total"],
                1 if item["normalized_owner"] == "__unassigned__" else 0,
                item["normalized_owner"],
            ),
        )

    # Çalışma alanında isimden projeyi bulan yardımcı fonksiyon.
    def _get_project(self, name: str) -> ProjectBlueprint:
        """İsme göre projeyi bulur, yoksa hata yükseltir."""

        slug = self._slugify(name)
        try:
            return self._projects[slug]
        except KeyError as exc:
            raise ProjectWorkspaceError(f"{name!r} adlı proje bulunamadı.") from exc

    # İsimleri slug formatına çeviren yardımcı metot.
    @staticmethod
    def _slugify(name: str) -> str:
        """Projeleri saklamak için kullanılan slug değerini üretir."""

        return "-".join(name.lower().split())


# Kilometre taşlarının durumlarını takip etmek için kullanılan enum.
class MilestoneStatus(str, Enum):
    """Kilometre taşı durumlarının metin karşılıklarını saklar."""

    PENDING = "pending"
    COMPLETED = "completed"


# Proje yol haritalarında kullanılan kilometre taşı veri sınıfı.
@dataclass
class Milestone:
    """Kilometre taşı detaylarını ve ilerleme durumunu saklar."""

    title: str
    description: str = ""
    due_date: Optional[str] = None
    status: MilestoneStatus = MilestoneStatus.PENDING

    # Kilometre taşını tamamlanmış olarak işaretleyen yardımcı metot.
    def complete(self) -> None:
        """Kilometre taşını tamamlandı olarak günceller."""

        self.status = MilestoneStatus.COMPLETED

    # Özet raporlarda kullanılacak sözlük çıktısını döndüren metot.
    def to_summary(self) -> Mapping[str, object]:
        """Kilometre taşını raporlamada kullanılacak formata çevirir."""

        return {
            "title": self.title,
            "description": self.description,
            "due_date": self.due_date,
            "status": self.status.value,
        }
