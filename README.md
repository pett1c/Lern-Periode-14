# Lern-Periode 14
# Eventify – Fullstack AI-Powered Event Management Platform

---

- Arvin - Backend
- Kenan - Frontend
- Ihor - KI-Integrierung

## 27.02

### Ihor

- [x] LLM und Typ (lokal/API-Schlüssel) auswählen und eine feste Systemprompt schreiben + Ausgabe erstellen
- [x] Mock-Daten mit fiktiven Events erstellen und ein Vektorisierungsskript schreiben (das Skript liest JSON mit Daten, generiert Vektoren und schreibt sie in die Vektordatenbank)
- [x] Ein RAG-Skript schreiben, das eine Testtextanfrage entgegennimmt, in einen Vektor konvertiert, die Vektordatenbank durchsucht, einen Kontext generiert und die Daten sendet.

---

### Arvin

- [x] Express-Server mit Grundstruktur, Middleware und einer funktionierenden Test-Route aufsetzen.
- [x] MongoDB Atlas anbinden, Environment-Variablen konfigurieren und eine stabile Datenbankverbindung herstellen.
- [x] User-Modell mit Passwort-Hashing implementieren und eine sichere Registrierungsfunktion erstellen.
- [x] Login-Funktion mit JWT-Token sowie Auth- und Rollen-Middleware für geschützte Routen entwickeln.

---

### Kenan

- [x] Low-Fidelity Mockup erstellen: grundlegende UI-Struktur aller Hauptseiten visuell planen, bevor implementiert wird.
- [x] React Projekt initialisieren: Frontend-Grundprojekt erstellen und lauffähig starten.
- [x] Grundordner & leere Seiten anlegen: Saubere Projektstruktur vorbereiten.

---


## 06.03

### Ihor

Absenz wegen FCE-Prüfung.

### Arvin

- [x] Event- und Ticket-Modelle + CRUD-Endpunkte.
- [x] Rollenregeln: Organizer darf Events verwalten; User darf buchen; Admin sieht globale Endpunkte.
- [x] Input-Validierung und konsistente API-Responses.


*Heute habe ich...*

#### API-Status 06.03 (Backend)

- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **Events CRUD:** `POST /api/events`, `GET /api/events`, `GET /api/events/:id`, `PATCH /api/events/:id`, `DELETE /api/events/:id`
- **Tickets:** `POST /api/tickets/book`, `GET /api/tickets/me`, `GET /api/tickets/:id`, `PATCH /api/tickets/:id/cancel`
- **Admin global:** `GET /api/admin/events`, `GET /api/admin/tickets`

#### Rollenmatrix

- **Organizer:** darf Events erstellen, bearbeiten und loeschen (nur eigene Events)
- **User:** darf Tickets buchen und eigene Tickets sehen/stornieren
- **Admin:** sieht globale Endpunkte fuer Events und Tickets

#### API-Response-Format

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {},
  "meta": {}
}
```

Fehler:

```json
{
  "success": false,
  "message": "Validation failed.",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  }
}
```

### Kenan

- [x] Mockup-Design umsetzen und verbessern
- [x] Seiten anzeigen & erstellen: Event-Funktionalität im Frontend umsetzen. 
- [ ] Authentifizierung (UI + API Anbindung): Registrierung- und Login-Seite funktional machen.

## 13.03

### Ihor

- [x] Reale Embedding-API integrieren: Dummy-Funktion durch API-Aufruf für reale Text-Vektorisierung ersetzen.
- [x] Vektorisierung mit MongoDB koppeln: Backend-Logik anpassen, damit bei der Event-Erstellung (CRUD) automatisch ein Vektor in Pinecone gespeichert wird.
- [x] Chat-Controller & Route erstellen: REST-Endpunkt (POST /api/chat) im Express-Backend für zukünftige Frontend-Anfragen implementieren.

Der Code ist fertig, aber die Tests finden erst in der nächsten Sitzung statt.

### Arvin

Absenz wegen CAE-Prüfung.

### Kenan

Absenz wegen CAE-Prüfung.


## 20.03

### Ihor

- [x] KI-Stand geprüft: Chat-/Embedding-Flow aus 13.03 analysiert und mit Backend-Routen abgeglichen.
- [x] DB-ID-Abgleich geplant: Event-IDs aus MongoDB mit Vektor-IDs synchronisieren.
- [x] Nächster Schritt definiert: Embedding-Pipeline direkt nach Event-CRUD triggern.

*Heute habe ich...*

- Done: Analyse von `backend/scripts/testRag.js` und `backend/data/mockEvents.json`.
- Next: Chat-Response auf echte Mongo-Event-IDs umstellen.
- Blocker: Ohne gültige API-Keys/DB-Zugriff nur eingeschränkte Laufzeittests möglich.

### Arvin

- [x] Aktuellen GitHub-Stand (`origin/main`) lokal synchronisiert und Arbeitsstand ersetzt.
- [x] Backend-Installationen und Smoke-Checks durchgeführt; fehlende `.env`-Konfiguration identifiziert.
- [x] Postman-Smoke-Checkliste für Rollen-/CRUD-/Ticket-Flows dokumentiert.

*Heute habe ich...*

- Done: Sync + Dependency-Setup + Backend-Testplan.
- Next: Sobald `.env` gesetzt ist, End-to-End-API-Tests mit `user/organizer/admin` durchlaufen.
- Blocker: `backend/.env` fehlt aktuell (mind. `MONGODB_URI`, `JWT_SECRET`, `OPENROUTER_API_KEY`).

### Kenan

- [x] Frontend-Auth (Register/Login/Logout) mit Token-Persistenz und API-Error-Anzeige integriert.
- [x] Event-Flow umgesetzt: Events laden + Event erstellen (Organizer/Admin).
- [x] Ticket-Flow umgesetzt: Buchen, „My Tickets“ laden, optionales Storno.

*Heute habe ich...*

- Done: Vite-Template in API-UI umgebaut (`frontend/src/App.jsx`).
- Next: UI in Seiten/Router-Komponenten aufteilen und Design verbessern.
- Blocker: Vollständige E2E-Tests erst nach laufendem Backend mit gültiger `.env`.


## 27.03

### Ihor

- [ ] Entwicklung der Frontend für Chat und Verknüpfung mit dem Chat-Endpunkt.
- [ ] Erstellung einer Vielzahl unterschiedlicher bestehender und origineller Events, um die Datenbank zu füllen.
- [ ] Testen des LLM anhand verschiedener Abfragen zu den Events.

### Arvin

- [ ] Backend-Fehlerbehandlung härten: einheitliche Statuscodes und klare `error.code`-Antworten in allen Controllern sicherstellen.
- [ ] Ticket-Booking absichern: Edge-Cases testen und fixen (zu hohe Menge, doppelte Stornierung, Zugriff auf fremde Tickets).
- [ ] API-Dokumentation erweitern: Auth-, Event-, Ticket- und Admin-Request/Response-Beispiele ergänzen.
- [ ] MongoDB-Setup standardisieren: `.env.example` vervollständigen und eine kurze Startanleitung für lokale Entwicklung dokumentieren.

### Kenan

- [ ] ...
- [ ] ...
- [ ] ...


## 24.04

### Ihor

- [ ] ...
- [ ] ...
- [ ] ...

### Arvin

- [ ] ...
- [ ] ...
- [ ] ...

### Kenan

- [ ] ...
- [ ] ...
- [ ] ...


## 08.05

### Ihor

- [ ] ...
- [ ] ...
- [ ] ...

### Arvin

- [ ] ...
- [ ] ...
- [ ] ...

### Kenan

- [ ] ...
- [ ] ...
- [ ] ...


## Reflexion

...

## MVP Backend-Frontend Alignment (Update)

- Frontend-Integration fokussiert auf diese Endpunkte:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `GET /api/events`
  - `POST /api/events`
  - `POST /api/tickets/book`
  - `GET /api/tickets/me`
  - `PATCH /api/tickets/:id/cancel`
- Sicherheitsregel bei Registrierung: Public Register erlaubt nur `user` und `organizer`.
- `admin` kann nicht mehr per Public Register gesetzt werden.
- Fehlerformat bleibt konsistent:
  - `success: false`
  - `message`
  - `error.code`
  - optional `error.details[]`
