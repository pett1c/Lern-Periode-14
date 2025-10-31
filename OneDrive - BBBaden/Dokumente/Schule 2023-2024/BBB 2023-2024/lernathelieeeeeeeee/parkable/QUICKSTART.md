# Quick Start Guide

## 🚀 Schnellstart

### 1. Dependencies installieren

```bash
npm install
```

### 2. Supabase Setup (Optional)

Die App funktioniert auch ohne Supabase im Demo-Modus. Für persistente Daten:

1. Erstelle ein Supabase-Projekt auf [supabase.com](https://supabase.com)
2. Führe das SQL-Script aus `supabase-setup.sql` im SQL Editor aus
3. Kopiere deine API-Keys aus Settings → API
4. Erstelle `.env.local`:

```bash
cp .env.example .env.local
```

5. Füge deine Supabase-Credentials ein:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
```

### 3. App starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

## 📁 Projektstruktur

```
parkly/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root Layout
│   ├── page.tsx           # Hauptseite
│   └── globals.css        # Globale Styles
├── components/             # React Komponenten
│   └── MapContent.tsx     # Karten-Komponente
├── lib/                    # Utilities
│   └── supabase.ts        # Supabase Client & Functions
├── supabase-setup.sql     # Datenbank-Schema
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript Config
├── tailwind.config.ts     # Tailwind Config
└── README.md              # Dokumentation
```

## 🎯 Features

- ✅ Interaktive Karte mit OpenStreetMap
- ✅ GPS-Standort-Erkennung
- ✅ Parkplätze hinzufügen und Status ändern
- ✅ Supabase-Integration (optional)
- ✅ Demo-Modus ohne Datenbank
- ✅ Responsive Design

## 🛠️ Entwicklung

### Build für Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 🔧 Troubleshooting

### Karte lädt nicht
- Überprüfe Browser-Konsole für Fehler
- Stelle sicher, dass Next.js läuft

### Supabase-Verbindung fehlgeschlagen
- Überprüfe `.env.local` Datei
- Stelle sicher, dass RLS-Policies gesetzt sind
- App läuft im Demo-Modus ohne Credentials

### TypeScript-Fehler
- Führe `npm install` erneut aus
- Überprüfe `tsconfig.json`

## 📚 Nächste Schritte

- [ ] User-Authentifizierung hinzufügen
- [ ] Real-time Updates mit Supabase Realtime
- [ ] Gamification-System erweitern
- [ ] Push-Benachrichtigungen
- [ ] Mobile App mit React Native

