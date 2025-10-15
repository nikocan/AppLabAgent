"""Frontend menülerini modellemek ve doğrulamak için yardımcı bileşenler."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Iterable, List, Mapping, Optional


# Menü operasyonlarında karşılaşılabilecek tutarsızlıkları temsil eden hata sınıfı.
class NavigationMenuError(ValueError):
    """Menü oluşturma veya güncelleme süreçlerinde oluşan hataları ifade eder."""


# Frontend menüsünde gösterilecek tekil öğeyi temsil eden veri sınıfı.
@dataclass
class MenuItem:
    """Menü etiketini, rotasını ve isteğe bağlı rozet bilgisini saklar."""

    key: str
    label: str
    route: str
    description: str = ""
    badge: Optional[str] = None

    # Menü öğesini JSON uyumlu sözlüğe dönüştüren yardımcı metot.
    def to_dict(self) -> Mapping[str, object]:
        """Menü öğesini frontend katmanında kullanılacak sözlük formatına çevirir."""

        exported: Dict[str, object] = {
            "key": self.key,
            "label": self.label,
            "route": self.route,
            "description": self.description,
        }
        if self.badge is not None:
            exported["badge"] = self.badge
        return exported


# Menü bölümlerini gruplayarak daha iyi gezinme deneyimi sağlayan veri sınıfı.
@dataclass
class MenuSection:
    """Menüde bir başlık altında listelenecek öğeleri ve açıklamayı taşır."""

    identifier: str
    title: str
    description: str = ""
    items: List[MenuItem] = field(default_factory=list)

    # Bölüme yeni menü öğesi ekleyen yardımcı metot.
    def add_item(self, item: MenuItem) -> None:
        """Menü öğesini bölüme ekler, aynı anahtar varsa hata üretir."""

        if any(existing.key == item.key for existing in self.items):
            raise NavigationMenuError(
                f"{item.key!r} anahtarına sahip menü öğesi zaten mevcut."
            )
        self.items.append(item)

    # Bölümde öğe olup olmadığını kolayca kontrol eden özellik.
    def is_empty(self) -> bool:
        """Bölümün içerisinde gösterilecek öğe kalmadığını bildirir."""

        return not self.items

    # Bölümü JSON uyumlu sözlüğe dönüştüren yardımcı metot.
    def to_dict(self) -> Mapping[str, object]:
        """Frontend katmanına gönderilecek bölüm bilgisini sözlük olarak döndürür."""

        return {
            "identifier": self.identifier,
            "title": self.title,
            "description": self.description,
            "items": [item.to_dict() for item in self.items],
        }


# Menüyü oluşturan, yeni bölümler ekleyen ve durumunu denetleyen ana sınıf.
class NavigationMenu:
    """Menüyü bölümler halinde yöneten ve boş alanları raporlayan yardımcı."""

    def __init__(self, sections: Optional[Iterable[MenuSection]] = None) -> None:
        self._sections: List[MenuSection] = []
        if sections:
            for section in sections:
                self.add_section(section)

    # Yeni bölüm eklemek için kullanılan yardımcı metot.
    def add_section(self, section: MenuSection) -> MenuSection:
        """Menüye yeni bir bölüm ekler, aynı kimlik varsa mevcut olanı döndürür."""

        existing = self.find_section(section.identifier)
        if existing is not None:
            return existing
        self._sections.append(section)
        return section

    # Kimliği verilen bölümü bulan yardımcı metot.
    def find_section(self, identifier: str) -> Optional[MenuSection]:
        """Belirtilen kimliğe sahip menü bölümünü döndürür."""

        for section in self._sections:
            if section.identifier == identifier:
                return section
        return None

    # Bölümün mevcut olduğundan emin olup yoksa oluşturan kolaylaştırıcı metot.
    def ensure_section(self, identifier: str, title: str, description: str = "") -> MenuSection:
        """Verilen kimlikte bölüm varsa döndürür, yoksa yeni bölüm oluşturup ekler."""

        existing = self.find_section(identifier)
        if existing is not None:
            if description and not existing.description:
                existing.description = description
            return existing
        section = MenuSection(identifier=identifier, title=title, description=description)
        self._sections.append(section)
        return section

    # Menünün mevcut durumunu sözlükler listesi olarak döndüren metot.
    def to_dict(self) -> List[Mapping[str, object]]:
        """Menü bölümlerini sırayla JSON uyumlu sözlükler listesi olarak döndürür."""

        return [section.to_dict() for section in self._sections]

    # Menüyü zorunlu bölümlere göre denetleyip eksik ve boş alanları raporlayan metot.
    def audit(self, required_sections: Optional[Iterable[str]] = None) -> Mapping[str, object]:
        """Menüde eksik veya boş kalan bölümleri raporlayarak frontend kontrollerini kolaylaştırır."""

        exported = self.to_dict()
        existing_identifiers = {section["identifier"] for section in exported}
        missing: List[str] = []
        if required_sections:
            for identifier in required_sections:
                if identifier not in existing_identifiers:
                    missing.append(identifier)

        empty = [section["identifier"] for section in exported if not section["items"]]
        return {
            "sections": exported,
            "missing_sections": missing,
            "empty_sections": empty,
        }


# Menü rotalarını oluştururken kullanılan küçük yardımcı fonksiyon.
def slugify(value: str) -> str:
    """Menü rotalarında kullanılmak üzere basit bir slug üretir."""

    cleaned = value.strip().lower()
    words = [chunk for chunk in cleaned.replace("_", " ").split() if chunk]
    return "-".join(words)
