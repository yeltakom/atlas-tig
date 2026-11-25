# Translation rules (Turkish -> English) for the Dicle Vadisi Atlası website
Source: /home/claude/atlas-tig/harita/  Target: /home/claude/en_src/ (same file names; data files go to /home/claude/en_src/data/)
Never edit files under /home/claude/atlas-tig. Do not run git.

1. Translate only text a visitor sees: string literals shown in the page, HTML text, title, aria-label, placeholder, alt, option labels, meta description. British English, plain academic tone, short sentences like the original.
2. Code must stay byte-identical apart from those strings: identifiers, object keys, ids, CSS classes, data-* values, hash routes (#dosyalar, #olaylar ... keep these Turkish route names exactly), file paths, URLs, regular expressions, code values such as gol_icinde, kiyi_1km, tasindi, kismen, birakildi, celiski, yerinde, eski, yeni, hat, kasaba, baraj, devlet, karsi, su_altinda, isletmede, acik, kisitli, bulunamadi, resmi, stk, akademik, basin, kisi, hane, konut. If a string is used both as a key and as display text, leave it.
3. Place and person names stay as they are (Hasankeyf, Batman, Ilısu, Beşiri, Er-Rızk ...). In running prose write "Tigris" for Dicle and "Batman River" for Batman Çayı. The site title becomes "Tigris Valley Atlas"; "Dicle Vadisi Atlası" in the scrolling band too.
4. Numbers in English format: decimal point, comma for thousands (318.1 km², 2,120 applications, 10.41 billion m³). Where code formats numbers Turkish style (replace('.',',') for decimals, or a sayi() helper inserting '.' as thousands separator), change it to English style. Dates "12 Mayıs 2017" -> "12 May 2017"; month name arrays -> English month names.
5. Strings built by concatenation: translate each fragment so the joined sentence reads correctly in English; you may reorder fragments within one expression if needed, but keep every variable.
6. Titles of published works, documents, films, laws and decisions keep their original wording; you may add an English gloss in square brackets after a Turkish title only in the visible label, never in a key.
7. No em dashes or en dashes in prose. Use commas, colons or full stops.
8. Keep "Visibility and Erasure" as is. Keep source citations (author year, page) as is, translating only Turkish connective words ("s." -> "p.", "ve diğerleri" -> "et al.", "içinde" -> "in").
9. After writing each JS file run `node --check FILE`. After each JSON file run python json.load. Then run: python3 /home/claude/en_src/check.py SOURCE TARGET to compare structure (if the file exists).
10. Finish with a report of at most 120 words: files written, anything you were unsure about.
