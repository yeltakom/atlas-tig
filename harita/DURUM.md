# Durum (25 Kasım 2026, sürüm 0.4)

## Yayında
- Atlas: 11 dosya, 59 olay, 260 yerleşim (Kürtçe/Ermenice ad ve 2007-2024 nüfus), anıtlar, 235 kayıtlık görsel arşiv, kütüphane, katmanlar, analiz, gün gün dolum (MODIS), PNG dışa aktarım, 3B düğmesi.
- 3B anlatı: 12 bölüm, su kotu modeli (525 m'de 286 km², 9,7 milyar m³; resmî 313 km², 10,41).
- Küre: dokuma dünya (boylam çizgileri karada kayar), bulut katmanı, korpus kayıtları üretici kentlerinde, Hasankeyf'e hatlar, bölüm katmanları, yıl sürgüsü, kayıt kartı.
- İngilizce sürüm: `en/`.

## Hiç gözle sınanmayanlar (ilk iş)
Önceki ortam canlı siteyi ve uydu altlıklarını açamıyordu. Hepsi altlıksız sınandı.
1. `hikaye.html`: 12 bölümün kamera açıları koordinattan kuruldu. `?kamera=1` ile bak, düzelt.
2. `kure.html`: NASA GIBS WMS bulut dokusu gerçekten geliyor mu; uydu parçaları yükleniyor mu.
3. Atlas ana haritası: uydu altlığı üstünde beyaz/siyah işaretlerin okunurluğu.
4. `en/`: çeviri gözden geçirilmedi.

## Bilinen veri sorunları
- 73 yerleşim doğrulanmamış hesap. RAP 2005 ve ÇED 2005 köy ekleri bulunamadı.
- Küre kent atamaları anahtar sözcükle; kişi adlarının çoğu İstanbul'a yazıldı, yanlışlar var.
- Korpus 235 kayıt, katalog 237 diyor; bölüm 14 (sergiler) eksik.
- Bazı korpus önizleme görselleri yanlış (ör. 2.03'te reklam görseli).
- `wikidata_yerlesim.json` sorgu çıktısından elle aktarıldı; atıftan önce kontrol.
- Kamulaştırma 2016: 48 köyün 43'ü konumlu, 15'inde ad eşleşmesi belirsiz. Resmî Gazete metni görülmedi.
- Arkeoloji 29 alanın 11'i, barajların 11'de 9'u konumsuz.
- Dosya 04 metni ana yol için 16 km, grafik 19 km diyor; hangisi doğru bakılacak.

## Açık işler
- Esri Wayback gerçek çekim tarihleri (`wayback_cekim.json`; ek.js hazır, veri yok).
- Sentinel-2 ile ay ay su yüzeyi (NDWI); yükseklik modeliyle köy köy derinlik.
- CORONA / tarihi hava fotoğrafı katmanı.
- Kopan yol bağlantıları ağ analizi.
- Saha fotoğraflarının yer eşleştirmesi (fotoğraflarda GPS yok).
- Küre: yakınlaşınca görüntülerin büyümesi, seçili bölümün öne çıkması.

## Dış kaynak adresleri (CORS doğrulandı)
- EOX Sentinel-2: `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-{YIL}_3857/default/g/{z}/{y}/{x}.jpg` (2017-2024)
- Esri Wayback: `.../World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/{sürüm}/{z}/{y}/{x}` (10=2014, 13045=2018, 12576=2019, 1049=2021, 41468=2024)
- NASA GIBS MODIS günlük Level9; JRC Global Surface Water `tiles2021`; arazi: `s3.amazonaws.com/elevation-tiles-prod/terrarium`.
