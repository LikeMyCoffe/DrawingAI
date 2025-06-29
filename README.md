# Aplicație de desen modernă (2025)

## Descriere generală

Această aplicație web permite utilizatorilor să deseneze liber pe un canvas, să aleagă culoarea și grosimea liniei, să încarce imagini peste care pot desena, să șteargă, să salveze sau să revină la pași anteriori ai desenului (Undo/Redo). Interfața este modernă, responsive și intuitivă, compatibilă atât cu desktop cât și cu dispozitive mobile.

---

## Funcționalități principale

- **Desen liber** cu mouse-ul sau touch (mobil/tabletă)
- **Alegere culoare** din paletă sau presetări rapide
- **Alegere grosime linie** cu slider
- **Încărcare imagine** (JPG, PNG, GIF, SVG, WEBP etc.) pe canvas, pentru desen peste imagine
- **Undo/Redo** pentru desen (revenire la pași anteriori sau refacere)
- **Ștergere canvas** (resetare rapidă)
- **Salvare desen** ca imagine PNG
- **Design modern și responsive**

---

## Structura proiectului


- `index.html` – Structura paginii web
- `style.css` – Stilizare modernă și responsive
- `script.js` – Funcționalitate interactivă (desen, încărcare imagine, undo/redo etc.)
- `README.md` – Documentație proiect (acest fișier)

---

## Instrucțiuni de utilizare

1. **Deschide fișierul `index.html`** într-un browser modern (Chrome, Firefox, Edge etc.).
2. **Desenează** pe canvas cu mouse-ul sau degetul (pe mobil).
3. **Alege culoarea** dorită din paleta de culori sau din butoanele presetate.
4. **Modifică grosimea liniei** folosind sliderul.
5. **Încarcă o imagine** apăsând pe „🖼️ Încarcă imagine” și selectează un fișier de pe calculator/dispozitiv.
6. **Șterge tot** apăsând pe „🧹 Șterge tot”.
7. **Salvează desenul** apăsând pe „💾 Salvează” (se descarcă automat ca PNG).
8. **Folosește Undo/Redo** cu butoanele „↩️ Undo” și „↪️ Redo” pentru a reveni la pași anteriori sau pentru a reface modificările.

---

## Tehnologii folosite

- **HTML5** – structură și elemente interactive
- **CSS3** – design modern, responsive, animații
- **JavaScript (ES6)** – logica aplicației, desen pe canvas, încărcare și salvare imagine, Undo/Redo

---

## Explicații tehnice

- **Canvas API** este folosit pentru desenarea liberă și pentru afișarea imaginilor încărcate.
- **FileReader API** permite încărcarea imaginilor locale și afișarea lor pe canvas.
- **Undo/Redo**: la fiecare acțiune importantă (desen, încărcare imagine, ștergere), starea canvasului este salvată, permițând revenirea la pași anteriori sau refacerea modificărilor.
- **Responsive design**: aplicația se adaptează automat la orice rezoluție, inclusiv pe mobil.
- **Evenimente mouse/touch**: desenul funcționează atât cu mouse-ul, cât și cu degetul pe ecran tactil.

---

## Extensii posibile

- Adăugare forme geometrice (dreptunghi, cerc, linie)
- Export SVG
- Mutare/redimensionare imagine încărcată
- Istoric desene

---

## Autori

- Gherghina Ana-Maria, Sima Maria, Arghir Teodora
- Master Comunicații Mobile, Grupa 411-CMob

---

## Demo

Deschide `index.html` în browser și încearcă funcționalitățile aplicației!
