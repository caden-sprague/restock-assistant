# Restock Assistant — UML Diagrams

UML views of the system described in [`restock_assistant_mvp_plan.md`](restock_assistant_mvp_plan.md).
Diagrams are written in [Mermaid](https://mermaid.js.org/) and render directly on GitHub.

---

## 1. Component Diagram

High-level boundaries: the mobile app talks only to our backend; the backend is
the only thing that talks to Micromart. `MicromartClient` owns external endpoints
and `AuthProvider` owns authentication.

```mermaid
flowchart TB
    subgraph Mobile["Mobile App — React Native / Expo"]
        direction TB
        UI["Screens<br/>(Session, Command, MatchConfirmation)"]
        BackendClient["backendClient.ts"]
        UI --> BackendClient
    end

    subgraph Backend["Backend — Node.js / TypeScript"]
        direction TB
        Routes["Routes + Controllers<br/>(session, command, inventory)"]

        subgraph Services["Services"]
            SessionService
            PlanogramService
            InventoryIndexService
            CommandParser
            InventoryResolver
            RestockService
            AuditLogService
        end

        MicromartClient["MicromartClient"]
        AuthProvider["AuthProvider<br/>(HardcodedCookieAuthProvider)"]

        Routes --> Services
        SessionService --> PlanogramService
        SessionService --> InventoryIndexService
        PlanogramService --> MicromartClient
        InventoryResolver --> InventoryIndexService
        CommandParser --> InventoryResolver
        InventoryResolver --> RestockService
        RestockService --> MicromartClient
        MicromartClient --> AuthProvider
        Services -.log.-> AuditLogService
    end

    Micromart["Micromart API<br/>(external)"]
    EnvConfig[(".env config<br/>cookie, siteId, sessionId")]

    BackendClient -- "JSON / HTTP" --> Routes
    MicromartClient -- "authenticated HTTP" --> Micromart
    AuthProvider -.reads.-> EnvConfig
```

---

## 2. Class Diagram (Backend)

Interfaces, services, and the core data models. `AuthProvider` is the seam that
lets a real login/2FA flow replace the hardcoded cookie later without touching
command, planogram, or restock logic.

```mermaid
classDiagram
    class AuthProvider {
        <<interface>>
        +getAuthHeaders() Promise~Record~string,string~~
    }
    class HardcodedCookieAuthProvider {
        +getAuthHeaders() Promise~Record~string,string~~
    }
    class LoginAuthProvider {
        +getAuthHeaders() Promise~Record~string,string~~
    }
    AuthProvider <|.. HardcodedCookieAuthProvider
    AuthProvider <|.. LoginAuthProvider

    class MicromartClient {
        +getPlanogram(siteId) Planogram
        +postRestockEvent(restockSessionId, event) Result
    }
    MicromartClient --> AuthProvider : uses

    class SessionService {
        +startSession(siteId, restockSessionId) SessionState
        +getActiveIndex() InventoryIndex
    }
    class PlanogramService {
        +fetchPlanogram(siteId) Planogram
    }
    class InventoryIndexService {
        +build(planogram) InventoryIndex
    }
    class CommandParser {
        +parse(text) ParsedCommand
    }
    class InventoryResolver {
        +resolve(query, index) ResolveResult
    }
    class RestockService {
        +submit(siteInventoryId, quantity) ApiResponse
    }
    class AuditLogService {
        +log(entry) void
    }

    SessionService --> PlanogramService
    SessionService --> InventoryIndexService
    PlanogramService --> MicromartClient
    InventoryIndexService --> InventoryIndex : builds
    InventoryResolver --> InventoryIndex : reads
    RestockService --> MicromartClient
    RestockService --> RestockEvent : builds
    SessionService ..> AuditLogService
    RestockService ..> AuditLogService

    class InventoryItem {
        +number siteInventoryId
        +string displayName
        +string normalizedName
        +string[] aliases
        +recipeId string|number
        +cellId string|number
        +position string
    }
    class InventoryIndex {
        +Map~number,InventoryItem~ byId
        +Map~string,InventoryItem[]~ byName
        +InventoryItem[] allItems
    }
    class ParsedCommand {
        +string action
        +string productQuery
        +number quantity
    }
    class RestockEvent {
        +string type
        +number quantity
        +number site_inventory_id
    }
    class AuditLogEntry {
        +string timestamp
        +string commandText
        +string parsedProductQuery
        +string matchedItemName
        +number siteInventoryId
        +number quantity
        +string status
        +string errorMessage
    }

    InventoryIndex "1" o-- "*" InventoryItem
    CommandParser ..> ParsedCommand : produces
    InventoryResolver ..> InventoryItem : matches
    AuditLogService ..> AuditLogEntry : writes
```

---

## 3. Sequence Diagram — Start Session

```mermaid
sequenceDiagram
    actor Stocker
    participant App as Mobile App
    participant API as Backend
    participant Auth as AuthProvider
    participant MC as MicromartClient
    participant MM as Micromart API

    Stocker->>App: Tap "Start Session"
    App->>API: POST /session/start {siteId, restockSessionId}
    API->>MC: getPlanogram(siteId)
    MC->>Auth: getAuthHeaders()
    Auth-->>MC: { Cookie }
    MC->>MM: GET /api/sites/{siteId}/planogram
    MM-->>MC: planogram JSON
    MC-->>API: planogram
    API->>API: build InventoryIndex
    API-->>App: { status: "ready", itemCount }
    App-->>Stocker: Show ready + command input
```

---

## 4. Sequence Diagram — Command (success, ambiguous, error)

```mermaid
sequenceDiagram
    actor Stocker
    participant App as Mobile App
    participant API as Backend
    participant CP as CommandParser
    participant IR as InventoryResolver
    participant RS as RestockService
    participant MM as Micromart API
    participant Log as AuditLogService

    Stocker->>App: "set fairlife to 5"
    App->>API: POST /commands { text }
    API->>CP: parse(text)

    alt unparseable
        CP-->>API: parse error
        API->>Log: log(error)
        API-->>App: { status: "error", message }
    else parsed { productQuery, quantity }
        CP-->>API: ParsedCommand
        API->>IR: resolve("fairlife", index)

        alt exactly one match
            IR-->>API: InventoryItem (siteInventoryId)
            API->>RS: submit(siteInventoryId, quantity)
            RS->>MM: POST /api/restocks/{id}/events {type:"correct", quantity, site_inventory_id}
            MM-->>RS: 200 OK
            RS->>Log: log(success)
            RS-->>API: success
            API-->>App: { status: "success", item, quantity }
        else multiple matches
            IR-->>API: options[]
            API-->>App: { status: "needs_confirmation", options, quantity }
            App-->>Stocker: Show product choices
            Note over App,API: continues in Confirm flow
        else no match
            IR-->>API: not found
            API->>Log: log(error)
            API-->>App: { status: "error", message }
        end
    end
```

---

## 5. Sequence Diagram — Confirm Ambiguous Match

```mermaid
sequenceDiagram
    actor Stocker
    participant App as Mobile App
    participant API as Backend
    participant RS as RestockService
    participant MM as Micromart API
    participant Log as AuditLogService

    Stocker->>App: Tap chosen product
    App->>API: POST /commands/confirm { siteInventoryId, quantity }
    API->>RS: submit(siteInventoryId, quantity)
    RS->>MM: POST /api/restocks/{id}/events {type:"correct", quantity, site_inventory_id}
    MM-->>RS: 200 OK
    RS->>Log: log(success)
    RS-->>API: success
    API-->>App: { status: "success", item, quantity }
    App-->>Stocker: "Fairlife Chocolate set to 5"
```
