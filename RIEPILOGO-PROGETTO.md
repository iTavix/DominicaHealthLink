# DominicaHealthLink — Riepilogo Progetto (handoff)

> Documento di contesto da usare in una nuova conversazione. Riassume **cosa è il progetto, com'è
> fatto, cosa è già stato implementato, cosa resta da fare e come si verifica**. Aggiornato all'ultima
> sessione di lavoro.

---

## 1. Cos'è
Applicazione web **gestionale** per seguire il trasferimento di **infermieri dalla Repubblica Dominicana
alle strutture sanitarie italiane**. Ogni candidato è una "pratica" che percorre **11 stati sequenziali**
(dall'acquisizione all'onboarding), con documenti, checklist, log e scadenze.

- ⚠️ **Aggiornamento (luglio 2026) — non più file singolo:** il progetto è stato migrato a **Vite**
  con sorgenti in `src/` (`app.js`, `i18n-data.js`, `styles.css`), Tailwind **compilato**, dipendenze
  npm **bloccate**, **service worker** per offline/avvii istantanei e splash screen di avvio.
  Vedi `README.md` per struttura e comandi (`npm run dev` / `build` / `preview`). Il vecchio
  monolite è conservato in `index.single-file.bak.html`. Le sezioni seguenti descrivono la logica
  applicativa, che è rimasta invariata.
- **Stack:** HTML + **Tailwind CSS** (compilato via build) + **Lucide icons** (npm) + **Vanilla
  JavaScript ES6** (nessun framework).
- **Backend/opzionale:** **Firebase** via SDK *compat* da CDN → **Authentication**, **Firestore**
  (database), **Storage** (file). Funziona anche **senza Firebase** in "modalità demo locale"
  (solo `localStorage`).
- **Lingue:** Italiano / Inglese / Spagnolo (i18n completo, con selettore in header e login).

---

## 2. Struttura dei file
```
DominicaHealthLink/
├── index.html                     ← l'intera app (UI + logica + i18n + manuale in-app)
├── firestore.rules                ← regole sicurezza database (per-utente + team condiviso)
├── storage.rules                  ← regole sicurezza file caricati
├── firebase.json                  ← config deploy regole (firestore + storage)
├── scripts/
│   ├── set-admin-claim.js         ← script Node per assegnare ruolo admin/operator (custom claims)
│   ├── package.json               ← dipendenza firebase-admin
│   ├── package-lock.json
│   ├── node_modules/              ← NON su git (rigenerabile con npm install)
│   └── serviceAccountKey.json     ← SEGRETO, NON su git (chiave service-account Firebase)
├── GUIDA-SETUP.md                 ← guida setup passo-passo in ITALIANO per principianti
├── FIREBASE-SETUP.md              ← guida setup tecnica in inglese (riferimento)
├── favicon.svg / apple-touch-icon.svg / apple-touch-icon.png / safari-pinned-tab.svg / site.webmanifest
├── .gitignore                     ← esclude la chiave segreta, node_modules, .DS_Store
├── prompt-gestionale-infermieri-claude-4.8.md   ← prompt originale
└── FIREBASE-SETUP copia.md        ← DUPLICATO da eliminare (creato per sbaglio)
```

---

## 3. Architettura interna (index.html)
- **Stato reattivo:** oggetto globale `state`. Ogni azione muta `state` → `commit()` → `saveState()` +
  `render()` che ricostruisce `#app` via `innerHTML`.
- **Event delegation:** un solo handler `click`/`change`/`input`/`submit`/`keydown` su `document`, con
  attributi `data-action="..."`.
- **i18n:** dizionario `I18N = { it, en, es }`, funzione `t(chiave, {var})`; lingua in `LANG`
  (persistita in `localStorage['dhl.lang']`). Gli 11 stati e le checklist sono localizzati per indice.
- **Tema:** chiaro/scuro via classe `.dark` su `<html>` + blocco di override CSS della palette slate;
  persistito in `localStorage['dhl.theme']`.
- **Ruoli:** `currentRole()` legge il **custom claim** Firebase (`role: 'admin'|'operator'`), con
  fallback (mappatura per email negli operatori) e default; `isAdmin()` blocca Impostazioni, elimina,
  export, scrittura settings.
- **Persistenza:**
  - *Per-utente* (default): documento Firestore `nurseflow/{uid}` con l'intero `state`.
  - *Team condiviso* (se `SHARED_WORKSPACE = true`): `organizations/{ORG_ID}/data/cases` (nurses,
    scrivibile dagli operatori) + `organizations/{ORG_ID}/data/settings` (settings, solo admin).
  - Cache locale sempre in `localStorage['nurseflow.state.v1']`.
- **File:** upload su **Firebase Storage** se attivo (`documents/users/{uid}/...` o
  `documents/org/{ORG_ID}/...`), altrimenti file piccoli (≤900 KB) come data-URL in locale.

### Flag di configurazione (in cima allo `<script>`)
```js
const FIREBASE_CONFIG = { ... };        // config del progetto Firebase reale (già inserita)
const SHARED_WORKSPACE = false;         // true = workspace condiviso di team
const ORG_ID = 'default';               // id organizzazione per il modello condiviso
```

### Modello dati (una "pratica"/nurse)
```js
{ id, name, passport, origin, partnerAgency, languageLevel, employer, hrReferent,
  currentStep (1..11), status, lastUpdate,
  documents: [{ id, name, language, uploadDate, validity, status: 'missing'|'pending'|'approved',
                fileName?, fileUrl?, fileSize?, fileStoragePath?, fileTooBig? }],
  checklist: { [stepId]: [{ id, step, idx, done }] },
  relocation: { flight, housing, tutor, contractStatus },
  logs: [{ id, at, type: 'note'|'call'|'alert'|'system', author, text }] }
```
```js
state = { version, view: 'dashboard'|'cases'|'documents'|'settings',
  selectedNurseId, search, statusFilter, docSearch, docFilter, demoRole,
  nurses: [...],
  settings: { agencies:[{id,name,country,contact}], employers:[{id,name,city}],
              operators:[{id,name,role,email,accessRole:'admin'|'operator'}],
              docTypes:[{id,name,language}] } }
```
Chiavi `localStorage`: `nurseflow.state.v1`, `dhl.lang`, `dhl.theme`, `dhl.operator.name`,
`nurseflow.tourSeen.v1`.

---

## 4. Funzionalità implementate (tutte funzionanti a livello logico)
**Viste (4 tab in header):** Dashboard · Gestione Pratiche · Documenti · Impostazioni (solo admin).

- **Dashboard:** 5 KPI (Pratiche attive, Documenti mancanti, In attesa OPI, **Doc. in scadenza**
  cliccabile, Onboarding completati); **Semafori di Rischio** (pratiche ferme oltre soglia SLA per
  stato); **pannello Documenti in Scadenza** (scaduti/entro 60 gg); candidati per struttura;
  distribuzione nei 11 stati; pulsante **Esporta CSV** (admin).
- **Gestione Pratiche (master-detail):** elenco con ricerca (nome/passaporto/struttura) e filtri
  (inclusi "A rischio"); scheda candidato con **intestazione modificabile**; **stepper 11 stati**
  (verde=fatto, indaco=corrente, ambra=bloccato); **"Avanza Stato"** sbloccato solo se checklist +
  documenti del passo sono a posto (mostra i requisiti mancanti); **gestione documenti**
  (Carica/Approva/Respingi/Aggiungi/Sostituisci); **checklist** per passo; **Logistica & Onboarding HR**
  modificabile; **Log comunicazioni & audit trail** (note/chiamate/avvisi).
- **Documenti (archivio):** tutti i documenti di tutti i candidati; ricerca + filtri (Tutti, Con file,
  **In scadenza**, Approvato, In verifica, Mancante); **anteprima in-app** (immagini, PDF in iframe,
  altri → download).
- **Caricamento file reale:** "Carica" apre il selettore file → upload su Firebase Storage (o data-URL
  locale per file piccoli); link/anteprima; "Sostituisci".
- **Scadenze documenti:** dalle date di `validity` → badge **Scaduto** / **In scadenza** (≤60 gg),
  filtro archivio, KPI + pannello in dashboard.
- **Anagrafiche (Impostazioni, admin):** CRUD di **Agenzie partner**, **Datori di lavoro/Strutture**,
  **Operatori HR** (con email + ruolo di accesso), **Tipi di documento** (definiscono i documenti di
  default dei nuovi candidati). I menu del form "Nuovo Candidato" pescano da queste liste.
- **CRUD candidato:** crea, **modifica anagrafica**, **elimina** (admin, con conferma).
- **Ruoli/permessi:** admin vs operatore; interfaccia gated + **enforcement lato server** (regole).
  In modalità demo, switch di ruolo nel profilo per provare.
- **Login & profilo:** Firebase Auth email/password + Google; scheda **Profilo Operatore** (nome,
  reset password, ruolo, dati account).
- **Guida interattiva:** tour a riflettore (9 step), parte al primo accesso, rilanciabile.
- **Manuale in-app:** overlay autosufficiente IT/EN/ES (10 sezioni), con Stampa/PDF. Aggiornato con
  tutte le funzioni (archivio, upload, scadenze, elimina, export, ecc.).
- **Dark mode**, **i18n IT/EN/ES**, **favicon** (SVG + Safari pinned-tab + iOS apple-touch PNG +
  manifest).
- **Export CSV** dei candidati (admin), con BOM UTF-8 per Excel.

---

## 5. Sicurezza (stato)
La sicurezza reale è **lato server** (le regole), non nel browser. File pronti nel repo:
- `firestore.rules` — deny-by-default; per-utente owner-only **oppure** team condiviso
  (cases = operatori, settings = solo admin). Limite ~1 MB/doc.
- `storage.rules` — file per-utente o per-team; max 20 MB; tipi PDF/immagini/office.
- `scripts/set-admin-claim.js` — assegna i ruoli via **custom claims** (bootstrap del primo admin).

**Azioni che deve fare l'utente nel proprio Firebase** (vedi GUIDA-SETUP.md sezione 4):
1. Firestore in **modalità produzione** e **pubblicare** `firestore.rules`.
2. **Abilitare Storage** e pubblicare `storage.rules` (per i file veri).
3. Abilitare i metodi Auth (Email/Password, Google).
4. **Bootstrap admin**: `node scripts/set-admin-claim.js email admin` (serve `serviceAccountKey.json`).
5. Domini autorizzati + **App Check** consigliato + HTTPS.
6. Solo dopo: eventualmente `SHARED_WORKSPACE = true`.

---

## 6. Come si esegue / verifica
- **In locale:** dalla cartella → `python3 -m http.server` → aprire `http://localhost:8000`
  (NON con doppio clic `file://`: rompe login Google e upload).
- **Verifica automatica usata finora:** in questo ambiente **non c'erano né Node né un browser**; il
  codice è stato validato con **JavaScriptCore** (`osascript -l JavaScript`) → parsing (`new Function`)
  + harness con DOM finto per testare la logica. ⚠️ **Non è stato testato in un browser reale**: da
  provare live il selettore file, l'anteprima PDF/immagini, le chiamate Firebase (login, sync, upload),
  il download CSV, il KPI cliccabile.

---

## 7. Stato Git
- Repository **inizializzato** (`git init`, branch `main`), **1 commit iniziale** (16 file).
- ⚠️ **Molte modifiche successive NON sono ancora committate** (tutte le feature dopo il primo commit:
  storage, archivio, scadenze, export, elimina, ecc.). → fare un **nuovo commit** prima del push.
- `serviceAccountKey.json` e `node_modules` correttamente **esclusi** dal `.gitignore` (verificato).
- Non ancora pushato su GitHub. Metodo consigliato per il primo push: **GitHub Desktop** (evita i token),
  repository **Private**.

---

## 8. Cose note / da migliorare (possibili prossimi passi)
- **Eliminare** il duplicato `FIREBASE-SETUP copia.md`.
- **Test reale nel browser** di tutte le integrazioni Firebase (mai fatto finora).
- **Concorrenza modello condiviso:** i documenti Firestore si scrivono per intero (last-write-wins).
  Per molti operatori simultanei conviene la variante **un documento per pratica**
  (`organizations/{orgId}/cases/{caseId}`) — non ancora implementata.
- Il **manuale** è mantenuto in 3 template literal separati (IT/EN/ES) → duplicazione da tenere allineata.
- Idee proposte e non ancora fatte: avviso scadenze **dentro la scheda del singolo candidato**; export
  **Excel/PDF** oltre al CSV; notifiche/promemoria; ruoli più granulari; storage con anteprima PDF più ricca.

---

## 9. Come far ripartire una nuova conversazione
Incolla questo file e di': *"Sto lavorando a questo progetto (vedi RIEPILOGO-PROGETTO.md nella cartella
DominicaHealthLink). Continua da qui: voglio [obiettivo]."* Ricordati che l'assistente non ha un browser
in ambiente: chiedi validazione via parsing/harness e poi prova tu nel browser reale.
