# Sudoku

Werbefreies Sudoku als installierbare PWA. Vier Schwierigkeitsgrade (Leicht,
Mittel, Schwer, Experte), Timer, Statistik, Hinweis-Funktion und
Konflikt-Validierung bei falscher Eingabe. Läuft komplett im Browser, kein
Backend, kein Tracking.

## Entwicklung

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Deployment auf GitHub Pages

Der Workflow unter `.github/workflows/deploy.yml` baut die App bei jedem Push
auf `main` und veröffentlicht sie auf GitHub Pages. Einmalig einrichten:

1. Repository-Einstellungen → **Pages** → unter "Build and deployment" als
   Quelle **GitHub Actions** auswählen.
2. Nach dem nächsten Push auf `main` ist die App unter
   `https://<benutzername>.github.io/Sudokupwa/` erreichbar.

## Auf dem Handy installieren

Seite im Browser öffnen und über "Zum Startbildschirm hinzufügen" (iOS) bzw.
"App installieren" (Android/Chrome) installieren.
