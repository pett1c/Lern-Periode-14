# Parkly - Supabase Setup Anleitung

## Schritt-für-Schritt Setup

### 1. Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle ein kostenloses Konto oder logge dich ein
3. Klicke auf "New Project"
4. Fülle die Projekt-Details aus:
   - **Name**: parkly (oder dein gewünschter Name)
   - **Database Password**: Wähle ein starkes Passwort (speichere es sicher!)
   - **Region**: Wähle die Region die am nächsten zu dir ist
5. Klicke auf "Create new project"
6. Warte 2-3 Minuten bis das Projekt bereit ist

### 2. SQL-Schema ausführen

1. Im Supabase Dashboard, gehe zu **SQL Editor** (linke Sidebar)
2. Klicke auf **New Query**
3. Öffne die Datei `supabase-setup.sql` aus diesem Projekt
4. Kopiere den gesamten SQL-Code
5. Füge ihn in den SQL Editor ein
6. Klicke auf **Run** (oder drücke `Ctrl+Enter` / `Cmd+Enter`)
7. Stelle sicher, dass alle Tabellen erfolgreich erstellt wurden

### 3. API-Keys kopieren

1. Im Supabase Dashboard, gehe zu **Settings** → **API**
2. Du findest dort:
   - **Project URL**: Kopiere diese URL
   - **anon/public key**: Kopiere diesen Key (der öffentliche Key)

### 4. Umgebungsvariablen setzen

1. Erstelle eine Datei `.env.local` im Root-Verzeichnis des Projekts:
   ```bash
   cp .env.example .env.local
   ```

2. Öffne `.env.local` und trage deine Supabase-Daten ein:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key-hier
   ```

3. **WICHTIG**: Die `.env.local` Datei ist bereits in `.gitignore` und wird nicht ins Repository hochgeladen!

### 5. App starten

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

## Tabellen-Struktur

### `parking_spots`
- Speichert alle Parkplätze mit Koordinaten und Status
- Wird automatisch mit aktuellen Timestamps aktualisiert

### `users`
- Speichert User-Daten (für zukünftige Auth-Features)
- Enthält Punkte und Level für Gamification

### `reports`
- Speichert alle Status-Änderungen als Historie
- Wird automatisch mit Punkten verknüpft

## Demo-Modus

Wenn keine Supabase-Credentials gesetzt sind, läuft die App im **Demo-Modus**:
- Alle Daten werden nur lokal im Browser gespeichert
- Keine Persistenz zwischen Sessions
- Funktioniert ohne Supabase-Setup

## Troubleshooting

### Fehler: "Invalid API key"
- Überprüfe, dass du den **anon/public key** kopiert hast (nicht den service_role key!)
- Stelle sicher, dass die `.env.local` Datei korrekt formatiert ist
- Starte den Dev-Server neu nach Änderungen an `.env.local`

### Fehler: "Table does not exist"
- Stelle sicher, dass das SQL-Schema vollständig ausgeführt wurde
- Überprüfe im Supabase Dashboard unter **Table Editor**, ob die Tabellen existieren

### Fehler: "RLS Policy violation"
- Überprüfe, dass die RLS-Policies korrekt erstellt wurden
- Im SQL Editor kannst du die Policies nochmal ausführen

### Karten laden nicht
- Stelle sicher, dass `next.config.js` die OpenStreetMap Domain erlaubt
- Überprüfe die Browser-Konsole auf Fehler

## Nächste Schritte

Nach dem Setup kannst du:
1. Die App im Browser testen
2. Parkplätze hinzufügen und Status ändern
3. Die Datenbank im Supabase Dashboard überwachen
4. Mit Real-time Updates experimentieren (Supabase Realtime)

## Support

Bei Problemen:
- Überprüfe die [Supabase Dokumentation](https://supabase.com/docs)
- Schaue in die Browser-Konsole für Fehler
- Überprüfe die Supabase Logs im Dashboard

