# Eventify – Fullstack AI-Powered Event Management Platform

## Description

**Eventify** is a modern event management platform built with the **MERN Stack** (MongoDB, Express, React, Node.js) and enhanced with an **AI Assistant** powered by **RAG (Retrieval-Augmented Generation)**.

The application allows:

- Organizers to create events, sell tickets, and view participant statistics.
- Users to browse events, book tickets, and use an intelligent AI Chat Assistant to discover events based on natural language queries (e.g., "I want to go to a rock concert this winter").
- Admins to monitor the platform and manage global statistics.

The project combines **CRUD operations**, **Vector Search & Embeddings**, **LLM Integration**, **Role & Permission Management**, and **Interactive Dashboards**.

---

## Features

### Backend

- JWT Authentication + Role-based access control (Admin, Organizer, User)
- REST API for events, tickets, and AI chat processing
- MongoDB with Mongoose for persistent data storage
- Vector Database (MongoDB Atlas Vector Search) for semantic event search
- AI Integration Layer: RAG pipeline, LLM service API integration, and automatic vector embedding generation on event CRUD operations
- QR-Code for tickets (nice-to-have feature)

### Frontend

- React + React Router
- Axios for API integration
- AI Chat Interface with dynamic rendering of interactive event cards within the conversation
- Dashboard with event overview, ticket status, and analytics
- Responsive design for Desktop & Mobile

---

## Structure

```
/eventify
|-- /backend
|   |-- /config
|   |   |-- db.js                   # Datenbankverbindung (MongoDB)
|   |   |-- vectorDb.js             # Konfiguration der Vektordatenbank
|   |-- /controllers
|   |   |-- authController.js       # Authentifizierungslogik
|   |   |-- eventController.js      # Event-Logik (inkl. Vektorisierung)
|   |   |-- ticketController.js     # Ticket-Verwaltungslogik
|   |   |-- chatController.js       # Verarbeitung von Chat-HTTP-Anfragen
|   |-- /services
|   |   |-- llmService.js           # Externe LLM-API-Integration
|   |   |-- embeddingService.js     # Generierung von Vektor-Embeddings
|   |   |-- ragService.js           # Semantische Suche und RAG-Logik
|   |-- /models
|   |   |-- User.js                 # Datenbankmodell für Benutzer
|   |   |-- Event.js                # Datenbankmodell für Events
|   |   |-- Ticket.js               # Datenbankmodell für Tickets
|   |   |-- Message.js              # Datenbankmodell für Chat-Nachrichten
|   |-- /routes
|   |   |-- auth.js                 # API-Routen für Authentifizierung
|   |   |-- events.js               # API-Routen für Events
|   |   |-- tickets.js              # API-Routen für Tickets
|   |   |-- chat.js                 # API-Routen für Chat
|   |-- /middleware
|   |   |-- auth.js                 # Middleware zur Überprüfung von Tokens
|   |   |-- role.js                 # Middleware für rollenbasierte Zugriffe
|   |-- /utils                      # Hilfsfunktionen
|   |-- app.js                      # Express-App-Konfiguration
|   |-- server.js                   # Servereinstiegspunkt und Start
|-- /frontend
|   |-- /src
|   |   |-- /pages
|   |   |   |-- Login.jsx           # Anmeldeseite
|   |   |   |-- Register.jsx        # Registrierungsseite
|   |   |   |-- Dashboard.jsx       # Haupt-Dashboard
|   |   |   |-- EventDetail.jsx     # Event-Detailansicht
|   |   |   |-- CreateEvent.jsx     # Seite zur Event-Erstellung
|   |   |   |-- MyTickets.jsx       # Übersicht gekaufter Tickets
|   |   |-- /components
|   |   |   |-- Navbar.jsx          # Navigationsleiste
|   |   |   |-- EventCard.jsx       # UI-Komponente für Event-Vorschau
|   |   |   |-- TicketCard.jsx      # UI-Komponente für Ticket-Details
|   |   |   |-- /chat
|   |   |   |   |-- ChatWindow.jsx  # Hauptfenster für die Chat-UI
|   |   |   |   |-- MessageBubble.jsx # UI-Komponente für einzelne Nachrichten
|   |   |-- /context                # React Context (z.B. Auth-Status)
|   |   |-- /api
|   |   |   |-- authApi.js          # API-Aufrufe für Authentifizierung
|   |   |   |-- eventApi.js         # API-Aufrufe für Events
|   |   |   |-- ticketApi.js        # API-Aufrufe für Tickets
|   |   |   |-- chatApi.js          # API-Aufrufe für Chat-Funktionen
|   |   |-- index.js                # React-Anwendungseinstiegspunkt
```

---

# Lern-Periode 14

Arvin - Backend
Kenan - Frontend
Ihor - KI-Integrierung


## 27.02

### Ihor

- [] LLM und Typ (lokal/API-Schlüssel) auswählen und eine feste Systemprompt schreiben + Ausgabe erstellen
- [] Mock-Daten mit fiktiven Events erstellen und ein Vektorisierungsskript schreiben (das Skript liest JSON mit Daten, generiert Vektoren und schreibt sie in die Vektordatenbank)
- [] Ein RAG-Skript schreiben, das eine Testtextanfrage entgegennimmt, in einen Vektor konvertiert, die Vektordatenbank durchsucht, einen Kontext generiert und die Daten sendet.

*Heute habe ich...*

### Arvin

- [] ...
- [] ...
- [] ...

*Heute habe ich...*

### Kenan

- [] ...
- [] ...
- [] ...

*Heute habe ich...*


## 06.03

### Ihor

- [] ...
- [] ...
- [] ...

*Heute habe ich...*

### Arvin

- [] ...
- [] ...
- [] ...

*Heute habe ich...*

### Kenan

- [] ...
- [] ...
- [] ...

*Heute habe ich...*


## 13.03

### Ihor

- [] ...
- [] ...
- [] ...

*Heute habe ich...*

### Arvin

- [] ...
- [] ...
- [] ...

*Heute habe ich...*

### Kenan

- [] ...
- [] ...
- [] ...

*Heute habe ich...*


## 20.03

### Ihor

- [] ...
- [] ...
- [] ...

*Heute habe ich...*

### Arvin

- [] ...
- [] ...
- [] ...

*Heute habe ich...*

### Kenan

- [] ...
- [] ...
- [] ...

*Heute habe ich...*


## 27.03

### Ihor

- [] ...
- [] ...
- [] ...

*Heute habe ich...*

### Arvin

- [] ...
- [] ...
- [] ...

*Heute habe ich...*

### Kenan

- [] ...
- [] ...
- [] ...

*Heute habe ich...*


## 24.04

### Ihor

- [] ...
- [] ...
- [] ...

*Heute habe ich...*

### Arvin

- [] ...
- [] ...
- [] ...

*Heute habe ich...*

### Kenan

- [] ...
- [] ...
- [] ...

*Heute habe ich...*


## 08.05

### Ihor

- [] ...
- [] ...
- [] ...

*Heute habe ich...*

### Arvin

- [] ...
- [] ...
- [] ...

*Heute habe ich...*

### Kenan

- [] ...
- [] ...
- [] ...

*Heute habe ich...*


## Reflexion

...
