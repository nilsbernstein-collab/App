# NicheTrack

Finanz-Tracker für Freelancer, Creator und Solopreneure mit unregelmäßigem
Einkommen. Offline-first Single-Page-App: alle Daten leben lokal in
IndexedDB, kein Server nötig zum Betrieb.

## Tech-Stack

- **React 19 + Vite + TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/vite`, kein separates PostCSS-Setup)
- **Zustand** für UI-State (Modals, Sidebar, Theme)
- **TanStack React Query** für async/server state, inkl. Optimistic Updates
- **Dexie.js** als IndexedDB-Layer (offline-first)
- **React Router** für Client-Side-Routing
- **Recharts** für Diagramme, **Framer Motion** für Animationen
- **jsPDF** für PDF-Reports/Rechnungen (lazy-loaded, nur bei tatsächlichem Export geladen)
- **Tesseract.js** für clientseitige Belegerkennung (OCR, lazy-loaded)

## Architektur

```
src/
  components/     UI-Komponenten, gruppiert nach Feature
    layout/         AppShell, Sidebar, Header, MobileNav
    dashboard/      Dashboard-spezifische Komponenten
    transactions/   Transaktionsformular (inkl. Beleg-Scan) & -liste
    invoices/       Rechnungsformular & Status-Badge
    charts/         Recharts-Wrapper (Bar/Line/Comparison)
    upgrade/        Upgrade- & Checkout-Modal
    reports/        Steuerrücklage, Export-Panel, Projekt-Rentabilität
    settings/       Kategorie-, Budget-, Projekt- & Recurring-Rule-Manager, API-Zugang
    common/         Modal, Skeleton, Icons, ProGate, ...
  pages/          Eine Komponente pro Route (Dashboard, Transactions, Invoices, Reports, Settings)
  hooks/          React-Query-Hooks (useTransactions, useCategories, ...) + abgeleitete Selektoren
  store/          Zustand-Stores (UI-State, Theme)
  data/
    db.ts                  Dexie-Schema + Seeding
    recurringGenerator.ts  Materialisiert fällige wiederkehrende Buchungen als echte Transaktionen
    repositories/          Ein Repository pro Entität — einziger Ort, der auf Dexie zugreift
  lib/            Reine Business-Logik ohne React-Abhängigkeit (Geld, Datum, Steuer, Prognose,
                  Export, Pricing, Recurrence, OCR-Parsing)
  types/          Domain-Typen (Transaction, Category, IncomeSource, Subscription, Settings,
                  RecurringRule, Project, Budget, Invoice)
```

### Warum ein Repository-Pattern?

Jeder Datenzugriff läuft über `src/data/repositories/*`. Komponenten und Hooks
kennen nur die Repository-Funktionen (`transactionRepository.create(...)`),
nie Dexie direkt. Der Grund: Der Umstieg von IndexedDB auf ein echtes Backend
(z. B. Supabase/Postgres) soll später möglich sein, ohne UI-Code anzufassen —
nur die Repository-Implementierungen müssten ausgetauscht werden. Die
Datenmodelle in `types/` sind bereits so geschnitten, dass sie 1:1 auf
Datenbank-Tabellen abbilden.

### State-Management-Aufteilung

- **Server-/Persistenzstate** (Transaktionen, Kategorien, Einkommensquellen,
  Subscription, Settings) läuft über React Query, das gegen die Repositories
  liest/schreibt. Mutationen nutzen Optimistic Updates (z. B.
  `useCreateTransaction`), damit neue Transaktionen sofort in der UI
  erscheinen, bevor der IndexedDB-Write bestätigt ist.
- **Reiner UI-State** (welches Modal ist offen, Sidebar-Status, Theme) liegt
  in Zustand-Stores (`store/uiStore.ts`, `store/themeStore.ts`) und hat
  nichts mit Persistenz zu tun.

### Kernfunktionen

- **Wiederkehrende Buchungen** (`data/recurringGenerator.ts`, `lib/recurrence.ts`): Regeln mit
  Frequenz/Intervall werden beim App-Start gegen `lastGeneratedDate` abgeglichen und fehlende
  Vorkommen als echte Transaktionen materialisiert — idempotent, auch nach längerer Abwesenheit.
- **Belegscan** (`lib/ocr.ts`): Tesseract.js läuft komplett im Browser (kein Cloud-OCR-Dienst),
  lädt sein Worker/Sprachmodell aber beim ersten Einsatz von einem CDN nach — dafür ist einmalig
  eine Internetverbindung nötig. Ein 30s-Timeout verhindert einen hängenden Zustand bei Netzwerkfehlern.
- **Budgets** (`hooks/useBudgetProgress.ts`): monatliches Limit pro Ausgaben-Kategorie, Fortschritt
  wird live aus den Transaktionen des laufenden Monats berechnet, keine eigene "Ist"-Ablage nötig.
- **Projekt-Rentabilität** (`hooks/useProjectProfitability.ts`): Transaktionen bekommen ein optionales
  `projectId`; Einnahmen/Ausgaben/Marge werden daraus abgeleitet, nicht separat gepflegt.
- **Rechnungen** (`hooks/useInvoices.ts`): Positionen, PDF-Export, Status-Tracking. Beim Markieren als
  „bezahlt" wird automatisch eine verknüpfte Einnahme-Transaktion erzeugt (`invoiceId`/`paidTransactionId`),
  damit Rechnungsstellung und Cashflow-Tracking konsistent bleiben statt doppelt gepflegt zu werden.

### Free-Tier / Pro-Tier

Limits sind zentral in `lib/limits.ts` und `lib/pricing.ts` definiert.
`components/common/ProGate.tsx` zeigt Pro-Inhalte Free-Nutzern als unscharfe
Vorschau mit Upgrade-CTA, statt sie komplett zu verstecken — Nutzer sollen den
Mehrwert sehen, bevor sie auf die Paywall treffen. Das Upgrade-Modal
(`components/upgrade/UpgradeModal.tsx`) wird kontextbezogen über
`useUiStore().openUpgradeModal(trigger)` an der Stelle geöffnet, an der ein
Limit erreicht wird (z. B. zweite Einkommensquelle, Export, Auto-Kategorisierung).

### Stripe / Zahlungen

Der Checkout-Flow (`components/upgrade/CheckoutModal.tsx`) ist aktuell ein
reiner Demo-Modus ohne echte Zahlungsabwicklung — `lib/checkout.ts` simuliert
eine Server-Antwort mit künstlicher Latenz. Das Verzeichnis `server-stubs/`
dokumentiert (in framework-agnostischem Pseudocode mit Kommentaren) die
Backend-Routen, die eine echte Stripe-Integration bräuchte: Checkout-Session
erstellen, Webhook-Handler für Subscription-Lifecycle-Events, sowie die
REST-Struktur für zukünftige Bank-/Shopify-Anbindungen (Pro-Feature
„API-Zugang"). Siehe `server-stubs/README.md` für die genauen Schritte, um
das an einen echten Server anzuschließen.

## Von Offline-First zu Backend

Die App ist bewusst so geschnitten, dass ein späterer Umstieg auf einen
echten Server keinen Rewrite erfordert:

1. Die Typen in `types/` werden zu DB-Tabellen/API-Schemas.
2. Die Funktionen in `data/repositories/*` werden von Dexie-Calls auf
   `fetch(...)`/Supabase-Client-Calls umgestellt — Signaturen bleiben gleich.
3. React-Query-Hooks in `hooks/*` ändern sich nicht, da sie nur die
   Repository-Funktionen aufrufen.
4. `server-stubs/` wird zur Basis für die echten API-Routen.

## Entwicklung

```bash
npm install
npm run dev      # Dev-Server
npm run build    # Typecheck + Production-Build
npm run lint      # Oxlint
```
