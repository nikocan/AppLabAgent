"""AccountRegistry bileşenine ait davranışları doğrulayan testler."""

from app_lab_agent.accounts import AccountRegistry, AccountRegistryError


# Hesap kayıt akışını doğrulayan test.
def test_register_and_list_accounts():
    registry = AccountRegistry()
    registry.register("github", "studio", {"plan": "team"}, tags=["scm"])
    registry.register("slack", "notifications", {"workspace": "applab"})

    accounts = registry.list_accounts()
    assert [(account.provider, account.name) for account in accounts] == [
        ("github", "studio"),
        ("slack", "notifications"),
    ]
    assert accounts[1].metadata["workspace"] == "applab"


# Aynı isimle ikinci defa kayıt yapılmasını engelleyen hata senaryosu.
def test_register_duplicate_account_raises():
    registry = AccountRegistry()
    registry.register("github", "studio")

    try:
        registry.register("GitHub", "Studio")
    except AccountRegistryError as exc:
        assert "zaten kayıtlı" in str(exc)
    else:  # pragma: no cover - test başarısız olduğunda devreye girer.
        raise AssertionError("Yinelenen hesaplar engellenmeliydi.")


# Meta veri güncelleme davranışını doğrulayan test.
def test_update_metadata_merges_values():
    registry = AccountRegistry()
    registry.register("github", "studio", {"plan": "team"})

    updated = registry.update_metadata("github", "studio", region="eu")
    assert updated.metadata == {"plan": "team", "region": "eu"}


# Serileştirme ve tersine çevirme akışını doğrulayan test.
def test_registry_serialization_roundtrip():
    registry = AccountRegistry()
    registry.register("github", "studio", {"plan": "team"})
    registry.register("slack", "notifications", {"workspace": "applab"}, tags=["alerts"])

    exported = registry.to_dict()
    restored = AccountRegistry.from_dict(exported)
    assert len(restored.list_accounts()) == 2
    assert restored.get("slack", "notifications").tags == ("alerts",)
