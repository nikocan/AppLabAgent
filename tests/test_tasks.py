"""TaskBoard ve Task bileşenlerinin davranışlarını sınayan testler."""

from app_lab_agent.tasks import Task, TaskBoard, TaskStatus


# Görev panosunun görev ekleme ve durum güncelleme özelliklerini test eder.
def test_task_board_lifecycle():
    board = TaskBoard()
    task = Task(identifier="plan", title="Plan oluştur", description="Proje için plan çıkar")
    board.add_task(task)

    board.mark_in_progress("plan", owner="melis")
    assert board.get_task("plan").owner == "melis"
    board.block_task("plan", "müşteri onayı bekleniyor")
    assert board.get_task("plan").status is TaskStatus.BLOCKED
    board.mark_done("plan")
    assert board.get_task("plan").status is TaskStatus.DONE


# İlerleme raporunun doğru şekilde hesaplandığını kontrol eden test.
def test_progress_report_counts_statuses():
    board = TaskBoard()
    board.add_task(Task(identifier="1", title="Görev 1", description=""))
    board.add_task(Task(identifier="2", title="Görev 2", description=""))
    board.add_task(Task(identifier="3", title="Görev 3", description=""))

    board.mark_in_progress("2")
    board.block_task("3", "entegrasyon bekleniyor")
    board.mark_done("1")

    report = board.progress_report()
    assert report == {
        "total": 3,
        "done": 1,
        "in_progress": 1,
        "blocked": 1,
        "pending": 0,
        "completion_ratio": 1 / 3,
    }


# İş yükü raporunun sorumlu bazında gruplanmasını doğrulayan test.
def test_workload_by_owner_includes_status_breakdown():
    board = TaskBoard()
    board.add_task(
        Task(
            identifier="plan",
            title="Planı hazırla",
            description="Plan taslağı çıkar",
            owner="Leyla",
        )
    )
    board.add_task(
        Task(
            identifier="implement",
            title="Uygulamayı geliştir",
            description="Çekirdek modülü yaz",
            owner="Leyla",
        )
    )
    board.add_task(
        Task(
            identifier="qa",
            title="Testleri çalıştır",
            description="Senaryoları doğrula",
            owner="Arda",
        )
    )
    board.add_task(
        Task(
            identifier="docs",
            title="Doküman yaz",
            description="Kullanım kılavuzu hazırla",
        )
    )

    board.mark_done("plan")
    board.mark_in_progress("implement")
    board.block_task("qa", "Test ortamı hazır değil")

    summary = board.workload_by_owner(include_unassigned=True)

    assert [entry["normalized_owner"] for entry in summary] == [
        "leyla",
        "arda",
        "__unassigned__",
    ]

    leyla_summary = summary[0]
    assert leyla_summary["total"] == 2
    assert leyla_summary["status_breakdown"] == {
        TaskStatus.PENDING.value: 0,
        TaskStatus.IN_PROGRESS.value: 1,
        TaskStatus.BLOCKED.value: 0,
        TaskStatus.DONE.value: 1,
    }
    assert {task["identifier"] for task in leyla_summary["tasks"]} == {
        "plan",
        "implement",
    }

    unassigned_summary = summary[-1]
    assert unassigned_summary["owner"] is None
    assert unassigned_summary["status_breakdown"][TaskStatus.PENDING.value] == 1


# Görev panosunun ön izleme çıktısının sıralama ve veri alanlarını doğrulayan test.
def test_export_tasks_orders_by_status_and_keeps_notes():
    board = TaskBoard()
    pending = Task(identifier="pending", title="Bekleyen", description="", owner=None)
    board.add_task(pending)
    in_progress = Task(
        identifier="progress",
        title="Devam eden",
        description="",
        owner="Zeynep",
    )
    board.add_task(in_progress)
    blocked = Task(identifier="blocked", title="Bloklu", description="", owner="Ali")
    board.add_task(blocked)
    done = Task(identifier="done", title="Tamamlandı", description="", owner="Eda")
    board.add_task(done)

    board.mark_in_progress("progress")
    board.block_task("blocked", "onay bekleniyor")
    board.mark_done("done")

    exported = board.export_tasks()
    assert [task["identifier"] for task in exported] == [
        "progress",
        "blocked",
        "pending",
        "done",
    ]
    blocked_payload = next(item for item in exported if item["identifier"] == "blocked")
    assert blocked_payload["notes"] and "onay bekleniyor" in blocked_payload["notes"][0]
