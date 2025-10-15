"""Projelerdeki görevleri ve durumlarını yönetmek için yardımcı bileşenler."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, Iterable, List, Mapping, Optional


# Görev yaşam döngüsündeki olası durumları tanımlayan enum.
class TaskStatus(str, Enum):
    """Görevlerin takibini kolaylaştırmak için kullanılan durumlar."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    DONE = "done"


# Bir proje içindeki tekil görevleri temsil eden veri sınıfı.
@dataclass
class Task:
    """Görev detaylarını ve takip bilgilerini saklar."""

    identifier: str
    title: str
    description: str
    status: TaskStatus = TaskStatus.PENDING
    owner: Optional[str] = None
    notes: List[str] = field(default_factory=list)

    # Göreve not eklemek için küçük bir yardımcı fonksiyon.
    def add_note(self, note: str) -> None:
        """Görevle ilgili alınan yeni notu saklar."""

        self.notes.append(note)


# Görevleri gruplayarak takip eden pano sınıfı.
class TaskBoard:
    """Bir projeye ait görevleri takip etmek için kontrol paneli sağlar."""

    def __init__(self, tasks: Optional[Iterable[Task]] = None) -> None:
        self._tasks: Dict[str, Task] = {}
        if tasks:
            for task in tasks:
                self.add_task(task)

    # Yeni görev eklemeye yarayan temel metot.
    def add_task(self, task: Task) -> None:
        """Görevi panoya ekler, aynı kimlik mevcutsa hata verir."""

        if task.identifier in self._tasks:
            raise ValueError(f"{task.identifier!r} kimliğine sahip görev zaten mevcut.")
        self._tasks[task.identifier] = task

    # Görev durumunu beklemeden devam ediyor konumuna çeken metot.
    def mark_in_progress(self, identifier: str, owner: Optional[str] = None) -> Task:
        """Görevi 'in_progress' olarak işaretler ve isteğe göre sorumlu atar."""

        task = self._get(identifier)
        task.status = TaskStatus.IN_PROGRESS
        if owner is not None:
            task.owner = owner
        return task

    # Görevi engellendi olarak işaretleyen metot.
    def block_task(self, identifier: str, reason: str) -> Task:
        """Görevi 'blocked' durumuna taşır ve açıklama ekler."""

        task = self._get(identifier)
        task.status = TaskStatus.BLOCKED
        task.add_note(f"BLOCKED: {reason}")
        return task

    # Görevi tamamlandı olarak işaretleyen metot.
    def mark_done(self, identifier: str) -> Task:
        """Görevi 'done' olarak işaretleyip döndürür."""

        task = self._get(identifier)
        task.status = TaskStatus.DONE
        return task

    # Görevi id ile sorgulayan yardımcı fonksiyon.
    def get_task(self, identifier: str) -> Task:
        """Verilen kimliğe sahip görevi panodan döndürür."""

        return self._get(identifier)

    # Görevleri durumlarına göre süzen metot.
    def list_by_status(self, status: Optional[TaskStatus] = None) -> List[Task]:
        """Belirli bir durumdaki görevleri veya tüm görevleri sıralar."""

        if status is None:
            return list(self._tasks.values())
        return [task for task in self._tasks.values() if task.status == status]

    # Görevleri sahiplerine göre listeleyen yardımcı metot.
    def list_by_owner(self, owner: str, include_unassigned: bool = False) -> List[Task]:
        """Belirtilen kişiye atanmış görevleri isteğe göre boş atamalarla birlikte döndürür."""

        normalized = owner.strip().lower()
        matched: List[Task] = []
        for task in self._tasks.values():
            if task.owner is None:
                if include_unassigned:
                    matched.append(task)
                continue
            if task.owner.strip().lower() == normalized:
                matched.append(task)
        return matched

    # Frontend ön izlemeleri için görevleri sıralı biçimde dışa aktaran yardımcı metot.
    def export_tasks(self) -> List[Mapping[str, object]]:
        """Görevleri durum önceliğiyle sıralayıp JSON uyumlu sözlükler halinde döndürür."""

        status_order = [
            TaskStatus.IN_PROGRESS,
            TaskStatus.BLOCKED,
            TaskStatus.PENDING,
            TaskStatus.DONE,
        ]
        status_priority = {status: index for index, status in enumerate(status_order)}
        ordered_tasks = sorted(
            enumerate(self._tasks.values()),
            key=lambda item: (
                status_priority.get(item[1].status, len(status_priority)),
                item[0],
            ),
        )

        exported: List[Mapping[str, object]] = []
        for _, task in ordered_tasks:
            exported.append(
                {
                    "identifier": task.identifier,
                    "title": task.title,
                    "description": task.description,
                    "status": task.status.value,
                    "owner": task.owner,
                    "notes": list(task.notes),
                }
            )
        return exported

    # Görev sahiplerinin iş yükü dağılımını raporlayan yardımcı metot.
    def workload_by_owner(
        self, include_unassigned: bool = False
    ) -> List[Mapping[str, object]]:
        """Görevleri sorumlularına göre gruplayıp durum dağılımı ile döndürür."""

        workloads: Dict[str, Dict[str, object]] = {}
        for task in self._tasks.values():
            owner = task.owner.strip() if task.owner else None
            if owner is None and not include_unassigned:
                continue

            normalized = owner.lower() if owner else "__unassigned__"
            bucket = workloads.setdefault(
                normalized,
                {
                    "owner": owner,
                    "normalized_owner": normalized,
                    "total": 0,
                    "status_breakdown": {status.value: 0 for status in TaskStatus},
                    "tasks": [],
                },
            )

            bucket["total"] += 1
            status_label = task.status.value
            bucket["status_breakdown"][status_label] += 1
            bucket["tasks"].append(
                {
                    "identifier": task.identifier,
                    "title": task.title,
                    "status": status_label,
                }
            )

        return sorted(
            workloads.values(),
            key=lambda item: (
                -item["total"],
                1 if item["normalized_owner"] == "__unassigned__" else 0,
                item["normalized_owner"],
            ),
        )

    # Görev panosunun ilerleme oranını hesaplayan metot.
    def progress_report(self) -> Dict[str, object]:
        """Durumlara göre görev sayılarını ve tamamlanma yüzdesini döndürür."""

        total = len(self._tasks)
        status_counts = {status: 0 for status in TaskStatus}
        for task in self._tasks.values():
            status_counts[task.status] += 1

        done = status_counts[TaskStatus.DONE]
        completion = (done / total) if total else 0.0
        return {
            "total": total,
            "done": done,
            "in_progress": status_counts[TaskStatus.IN_PROGRESS],
            "blocked": status_counts[TaskStatus.BLOCKED],
            "pending": status_counts[TaskStatus.PENDING],
            "completion_ratio": completion,
        }

    # İçeride kullanılan ortak görev alma fonksiyonu.
    def _get(self, identifier: str) -> Task:
        """Görev panosunda ilgili kimliği arar, bulunamazsa hata üretir."""

        try:
            return self._tasks[identifier]
        except KeyError as exc:  # pragma: no cover - hata mesajını özelleştiriyoruz.
            raise KeyError(f"{identifier!r} kimliğine sahip görev bulunamadı.") from exc
