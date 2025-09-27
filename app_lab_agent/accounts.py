"""App Lab Agent platformunda hesap bağlantılarını yönetmek için yardımcılar sağlar."""

from __future__ import annotations

from dataclasses import dataclass, replace
from typing import Dict, Iterable, List, Mapping, MutableMapping, Optional, Tuple


# Hesap bağlantılarının saklanmasında kullanılan özel hata türü.
class AccountRegistryError(RuntimeError):
    """Hesap kayıt işlemleri sırasında oluşan hataları temsil eder."""


# Harici servisler için tutulacak hesap meta verisini modelleyen veri sınıfı.
@dataclass(frozen=True)
class LinkedAccount:
    """Bir entegre servis hesabına ait temel bilgileri taşır."""

    provider: str
    name: str
    metadata: Mapping[str, str]
    tags: Tuple[str, ...] = ()

    # Meta veriyi güncelleyen yardımcı fonksiyon.
    def with_metadata(self, **metadata: str) -> "LinkedAccount":
        """Var olan meta veriye yeni alanlar eklenmiş kopyayı döndürür."""

        new_metadata = dict(self.metadata)
        new_metadata.update(metadata)
        return replace(self, metadata=new_metadata)


# Bağlı hesapları hafızada saklayıp hızlı erişim sağlayan kayıt defteri sınıfı.
class AccountRegistry:
    """Harici servis hesaplarının kaydını tutar ve sorgular."""

    def __init__(self, accounts: Optional[Iterable[LinkedAccount]] = None) -> None:
        self._accounts: MutableMapping[Tuple[str, str], LinkedAccount] = {}
        if accounts:
            for account in accounts:
                self.register(account.provider, account.name, account.metadata, account.tags)

    # Hesap kaydeden ana yardımcı metot.
    def register(
        self,
        provider: str,
        name: str,
        metadata: Optional[Mapping[str, str]] = None,
        tags: Optional[Iterable[str]] = None,
    ) -> LinkedAccount:
        """Yeni bir hesabı kayıt altına alır; aynı anahtar varsa hata döndürür."""

        key = self._normalise_key(provider, name)
        if key in self._accounts:
            raise AccountRegistryError(
                f"{provider!r} sağlayıcısı için {name!r} adına sahip hesap zaten kayıtlı."
            )

        metadata = metadata or {}
        account = LinkedAccount(provider=provider, name=name, metadata=dict(metadata), tags=tuple(tags or ()))
        self._accounts[key] = account
        return account

    # Hesap meta verisini güncelleyen yardımcı metot.
    def update_metadata(self, provider: str, name: str, **metadata: str) -> LinkedAccount:
        """Belirtilen hesabın meta verisine yeni alanlar ekleyerek günceller."""

        key = self._normalise_key(provider, name)
        account = self._ensure_exists(key)
        updated = account.with_metadata(**metadata)
        self._accounts[key] = updated
        return updated

    # Hesabı kayıt defterinden silen metot.
    def remove(self, provider: str, name: str) -> LinkedAccount:
        """İlgili hesabı kaldırır ve kaldırılan örneği döndürür."""

        key = self._normalise_key(provider, name)
        account = self._ensure_exists(key)
        del self._accounts[key]
        return account

    # Hesap detaylarını sorgulamaya yarayan metot.
    def get(self, provider: str, name: str) -> LinkedAccount:
        """Sağlayıcı ve ad bilgisine göre hesabı döndürür."""

        key = self._normalise_key(provider, name)
        return self._ensure_exists(key)

    # Kayıtlı hesapları listeleyen metot.
    def list_accounts(self, provider: Optional[str] = None) -> List[LinkedAccount]:
        """Tüm hesapları veya belirli sağlayıcıya ait olanları sıralı şekilde döndürür."""

        if provider is None:
            values = list(self._accounts.values())
        else:
            provider_key = provider.lower()
            values = [acc for acc in self._accounts.values() if acc.provider.lower() == provider_key]
        return sorted(values, key=lambda acc: (acc.provider.lower(), acc.name.lower()))

    # Depolanan hesapları sözlük yapısına dönüştüren araç metot.
    def to_dict(self) -> Dict[str, Dict[str, Dict[str, object]]]:
        """Kayıtlı hesapları kalıcı depolama için serileştirir."""

        exported: Dict[str, Dict[str, Dict[str, object]]] = {}
        for account in self._accounts.values():
            exported.setdefault(account.provider, {})[account.name] = {
                "metadata": dict(account.metadata),
                "tags": list(account.tags),
            }
        return exported

    # Sözlükten kayıt defteri oluşturan sınıf metodu.
    @classmethod
    def from_dict(cls, data: Mapping[str, Mapping[str, Mapping[str, object]]]) -> "AccountRegistry":
        """Serileştirilmiş sözlük yapısından yeni kayıt defteri oluşturur."""

        accounts: List[LinkedAccount] = []
        for provider, entries in data.items():
            for name, definition in entries.items():
                metadata = definition.get("metadata") or {}
                tags = definition.get("tags") or []
                accounts.append(
                    LinkedAccount(
                        provider=provider,
                        name=name,
                        metadata=dict(metadata),
                        tags=tuple(tags),
                    )
                )
        return cls(accounts)

    # İç anahtar üretimi için kullanılan yardımcı fonksiyon.
    @staticmethod
    def _normalise_key(provider: str, name: str) -> Tuple[str, str]:
        """Hesapları provider ve isim bazında anahtarlamak için standartlaştırma uygular."""

        return provider.lower(), name.lower()

    # İç tutarlılığı kontrol eden yardımcı metot.
    def _ensure_exists(self, key: Tuple[str, str]) -> LinkedAccount:
        """Verilen anahtarın kayıtlı olduğundan emin olur, aksi durumda hata döndürür."""

        if key not in self._accounts:
            provider, name = key
            raise AccountRegistryError(
                f"{provider!r} sağlayıcısı için {name!r} hesabı bulunamadı."
            )
        return self._accounts[key]
