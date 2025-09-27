"""App Lab Agent platformu için otomasyon akışlarını yöneten yardımcılar."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Iterable, List, Mapping, Optional

from .accounts import AccountRegistry, LinkedAccount


# Otomasyonlarda meydana gelen doğrulama sorunlarını temsil eden hata sınıfı.
class AutomationValidationError(RuntimeError):
    """Otomasyon tariflerinde tutarsızlık olduğunda yükseltilen hata."""


# n8n veya benzeri araçlarda kullanılmak üzere tanımlanan otomasyon tarifini modelleyen veri sınıfı.
@dataclass
class AutomationRecipe:
    """Bir otomasyonun tetikleyicisini, aksiyonlarını ve ihtiyaç duyduğu hesapları saklar."""

    name: str
    trigger: str
    actions: List[str]
    required_accounts: List[str] = field(default_factory=list)
    description: Optional[str] = None

    # Otomasyon planını n8n benzeri araçların beklediği forma dönüştüren fonksiyon.
    def to_n8n_payload(self) -> Mapping[str, object]:
        """n8n API'lerinin bekleyebileceği basit bir JSON şemasına dönüştürür."""

        return {
            "name": self.name,
            "trigger": self.trigger,
            "actions": list(self.actions),
            "accounts": list(self.required_accounts),
            "description": self.description,
        }


# Otomasyon tariflerini kaydeden ve doğrulayan stüdyo sınıfı.
class AutomationStudio:
    """Otomasyon tarifleri üzerinde doğrulama ve raporlama yapan yönetici."""

    def __init__(self, account_registry: Optional[AccountRegistry] = None) -> None:
        self._recipes: Dict[str, AutomationRecipe] = {}
        self._accounts = account_registry or AccountRegistry()

    # Yeni otomasyon tarifi oluşturan metot.
    def create_recipe(
        self,
        name: str,
        trigger: str,
        actions: Iterable[str],
        required_accounts: Optional[Iterable[str]] = None,
        description: Optional[str] = None,
    ) -> AutomationRecipe:
        """Tarifi oluşturup kayıt altına alır; aynı isim varsa hata verir."""

        key = name.lower()
        if key in self._recipes:
            raise AutomationValidationError(f"{name!r} adına sahip otomasyon zaten kayıtlı.")

        recipe = AutomationRecipe(
            name=name,
            trigger=trigger,
            actions=list(actions),
            required_accounts=list(required_accounts or []),
            description=description,
        )
        self._recipes[key] = recipe
        return recipe

    # Otomasyonu güncelleyip gerekli hesapları değiştiren metot.
    def update_required_accounts(self, name: str, accounts: Iterable[str]) -> AutomationRecipe:
        """Otomasyonun ihtiyaç duyduğu hesap listesini değiştirir."""

        recipe = self._get(name)
        recipe.required_accounts = list(accounts)
        return recipe

    # Otomasyonların ihtiyaç duyduğu hesapların kayıtlı olduğundan emin olan doğrulama metodu.
    def validate_accounts(self, name: str) -> List[LinkedAccount]:
        """Tarifin talep ettiği tüm hesapların kayıtlı olduğunu doğrular."""

        recipe = self._get(name)
        linked: List[LinkedAccount] = []
        missing: List[str] = []
        for account_name in recipe.required_accounts:
            provider, _, name_fragment = account_name.partition(":")
            lookup_provider = provider or account_name
            lookup_name = name_fragment or account_name
            try:
                account = self._accounts.get(lookup_provider, lookup_name)
            except Exception:  # pragma: no cover - hata mesajını özelleştiriyoruz.
                missing.append(account_name)
            else:
                linked.append(account)
        if missing:
            raise AutomationValidationError(
                "Eksik hesaplar bulundu: " + ", ".join(sorted(missing))
            )
        return linked

    # Kayıtlı otomasyonları listeleyen metot.
    def list_recipes(self) -> List[AutomationRecipe]:
        """Tüm otomasyon tariflerini alfabetik sırada döndürür."""

        return [self._recipes[key] for key in sorted(self._recipes)]

    # Otomasyonun n8n'e aktarılmaya hazır özetini döndüren metot.
    def export_recipe(self, name: str) -> Mapping[str, object]:
        """Tarifi doğrulayarak n8n uyumlu çıktı üretir."""

        recipe = self._get(name)
        self.validate_accounts(name)
        return recipe.to_n8n_payload()

    # İç kullanım için tarif arayan fonksiyon.
    def _get(self, name: str) -> AutomationRecipe:
        """Verilen isimdeki tarifi getirir, yoksa hata oluşturur."""

        key = name.lower()
        try:
            return self._recipes[key]
        except KeyError as exc:
            raise AutomationValidationError(f"{name!r} isimli otomasyon bulunamadı.") from exc
