# Busimaster – Nawigator Spraw Klienta

Interaktywny kreator (wizard), który prowadzi pośrednika krok po kroku przez diagnozę sytuacji klienta i rekomenduje najlepszą usługę oddłużeniową.

## Uruchomienie lokalne

1. Zainstaluj dowolny prosty serwer statyczny (np. `python -m http.server`).
2. W katalogu repozytorium uruchom serwer, np.:

   ```bash
   python -m http.server 8000
   ```

3. Otwórz przeglądarkę i przejdź pod adres [http://localhost:8000](http://localhost:8000), a następnie wybierz plik `index.html`.

## Struktura kreatora

- `index.html` – struktura aplikacji i kontener dla kreatora.
- `styles.css` – styl wizualny kroków i ekranu podsumowania.
- `script.js` – logika drzewa decyzyjnego prowadzącego do rekomendacji.

Kreator obejmuje trzy ścieżki (osoba fizyczna, przedsiębiorca, spółka z o.o.) i kończy się rekomendacją wraz z uzasadnieniem oraz estymowaną szansą na sukces.
