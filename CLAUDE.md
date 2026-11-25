# atlas-tig: Visibility and Erasure / Dicle Vadisi Atlası

Yelta Köm'ün doktora araştırmasının (Ilısu Barajı, Hasankeyf, Dicle vadisi) web atlası. GitHub Pages, `main` dalının kökünden yayınlanır.
Canlı: https://yeltakom.github.io/atlas-tig/harita/

## Yapı
- Kök (`index.html`, `atlas_data.json`, `images/`): eski görsel katalog (Visibility and Erasure). Dokunma, yalnızca oku.
- `harita/`: atlas. `index.html` + `app.js` (harita, katmanlar) + `platform.js` (dosyalar, olaylar, anıtlar, arşiv) + `ek.js` (rapor verisi, yerleşim kartı, kütüphane, gün gün dolum, 3B düğmesi).
- `harita/hikaye.*`: üç boyutlu anlatı (MapLibre arazi, su kotu modeli).
- `harita/kure.*`, `harita/kure/`: Three.js küre; korpus kayıtları üretici kentlerinin üstünde. `kure/kure.json` kent ataması (anahtar sözcükle, yaklaşık).
- `harita/en/`: İngilizce sürüm. Elle üretilir: Türkçe dosya değişince çeviri de güncellenmeli (`harita/_calisma/build_en.py`, kurallar `KURALLAR.md`).
- `harita/data/`: veri. Her kayıtta kaynak alanı zorunlu.
- `harita/_calisma/`: sınama betikleri (playwright) ve çeviri araçları. Yayının parçası değil.

## Değişmez kurallar
- Site arama motorlarına kapalı kalır: her HTML'de `noindex, nofollow, noarchive` meta etiketi.
- `saha_isaretleri.geojson` (araştırmacının kendi yer işaretleri) depoya ve yayına GİRMEZ. Yalnızca T7'deki yerel kopyada durur.
- Görüşmeler, görüşülen kişiler ve görüşme yerleri onay bitene kadar haritalanmaz, adlandırılmaz.
- T7'deki ham veri (`08_Maps_GIS`, `01_Field_Photographs`, `scraped`) salt okunur. Yalnızca `09_Atlas_Projesi` içine yaz. Diskte dosya silme.
- Tez metnini Yelta yazar. Burada veri, harita, kısa kayıt metni üretilir; tez paragrafı yazılmaz.
- Metinlerde uzun tire yok. Kısa cümle, kaynaklı.
- Hesapla bulunan sonuçlar (73 yerleşim, su modeli, konum atamaları) "hesap, doğrulanmadı" diye etiketlenir. Koordinat ya da kaynak uydurma.
- Görsel dil: Urban Surveillance Bureau çizgisi. Yalnız siyah, beyaz, gri; kalın Helvetica; 1 px çizgi; köşe yuvarlama, gölge, renk yok. Haritada kategori renkle değil biçimle ayrılır (üçgen kazı, çarpı eski yer, kare yeni yer, boş kare yeni yerleşim, elmas kamulaştırma). İstisna: göl sınırı kürede pembe.
- Kullanımı düşük tut, yanıtlar kısa ve Türkçe.

## Çalışma düzeni
- Dal: `harita-atlasi`. Yayın için aynı commit `main`'e de itilir: `git push origin harita-atlasi && git push origin harita-atlasi:main`.
- Yerelde bak: `cd harita && python3 -m http.server 8000`. Değişikliği tarayıcıda gerçek uydu altlığıyla gör, sonra it.
- JS/CSS değişince HTML'deki `?v=` sayısını artır (önbellek).
- Yayından sonra `harita/` içeriğini T7'ye kopyala: `/Volumes/T7 Shield/25_TUR_Batman/22_TUR_Hasankeyf/09_Atlas_Projesi/site/` (saha dosyasına dokunmadan).

Güncel durum ve açık işler: `harita/DURUM.md`.
