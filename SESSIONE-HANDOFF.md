# DominicaHealthLink / DHL Nurses — Handoff sessione

> File di contesto per aprire una nuova sessione di lavoro con Claude.
> Aggiornato: 11 luglio 2026. Incolla o referenzia questo file all'avvio:
> *"Leggi DominicaHealthLink/SESSIONE-HANDOFF.md e continua da lì: voglio [obiettivo]."*

---

## 1. I due progetti

| | Produzione | Demo presentazioni |
|---|---|---|
| Cartella | `~/Desktop/claude_code/DominicaHealthLink` | `~/Desktop/claude_code/demo_dhl_nurses` |
| Repo | github.com/iTavix/DominicaHealthLink | github.com/iTavix/dhl-nurses-demo (pubblico) |
| Live | itavix.github.io/DominicaHealthLink/ | itavix.github.io/dhl-nurses-demo/ |
| Brand | DominicaHealthLink | **DHL Nurses** |
| Backend | Firebase Auth + Firestore (workspace condiviso) | Nessuno: demo locale permanente (apiKey vuota) |

**Deploy**: push su `main` → GitHub Action builda Vite e pubblica `dist/` su Pages (~1 min). Mai caricare file dall'interfaccia web di GitHub. Credenziali git nel portachiavi macOS (token con permessi Contents+Workflows).

**La demo è una copia divergente**: le feature nuove del gestionale NON ci arrivano da sole — vanno riportate a mano se serve. La demo ha in più: welcome page con carosello automatico 6 slide, 6 candidati fittizi (step 2,3,5,8,9,11), banner da presentazione, brand DHL Nurses.

## 2. Stack e struttura (identica nei due repo)

- Vite 6 + Tailwind 3 compilato + lucide + firebase compat 10.12.2 (versioni bloccate in package.json)
- `index.html` (shell + splash) · `src/app.js` (tutta la logica, ~3400 righe) · `src/i18n-data.js` (IT/EN/ES) · `src/guide-content.js` (guida normativa, sync manuale col .md alla radice) · `src/styles.css` · `public/sw.js` (service worker)
- Comandi: `npm run dev` / `build` / `preview` (preview prod: porta 4599 = launch `nurseflow`; demo: 4601 = `dhldemo`)

## 3. Funzionalità implementate

### Sessione 12 lug 2026 — Ritocchi UI + numero infermieri (non ancora deployato)

- **Anagrafica**: fase corrente e consenso privacy spostati come chips accanto al nome nell'intestazione (con pulsantino stampa modulo); rimossi dalla scheda "Dati anagrafici".
- **Richieste matching con organico**: campo `quantity` (numero infermieri richiesti) + **abbinamenti multipli** (`r.matched` = array di {id,name,at}); la richiesta resta Aperta finché non copre tutti i posti (badge «a/b abbinati»), poi diventa Abbinata; ✕ sul singolo chip rimuove quel solo abbinamento. Migrazione in `normalizeState` dei vecchi campi `matchedNurseId/Name/At`. Seed: richiesta Padova ora quantity 2.
- Manuale §6.1 aggiornato (IT/EN/ES). Testato su :4610 incluse migrazione legacy e flusso 0/2→2/2→1/2.

### Sessione 11 lug 2026 (sera) — PROTOCOLLO MATCHING 2.0 (non ancora deployato)

Da «struttura progetto 2.0 2.md» (protocollo operativo di matching tecnico):
- **Specializzazioni cliniche strutturate** sul candidato (`nurse.specializations`, catalogo configurabile in Impostazioni → Specializzazioni, default 10 voci in `DEFAULT_SPECIALTIES`). Si spuntano come chips in Modifica anagrafica; visibili nella scheda Competenze e nel CSV.
- **Documento «Dossier Italia in tasca»** aggiunto ai doc personali (facoltativo: non blocca la pipeline, ma il matching lo verifica).
- **Richieste delle strutture** (`state.requests`, sincronizzate nel doc Firestore `cases` insieme ai nurses — le regole attuali le accettano già, NIENTE da ripubblicare): struttura, reparto, turno, competenze minime, preferenziali, note; stati aperta/abbinata/chiusa.
- **Vista Matching** (nuova scheda di navigazione): elenco richieste, «Nuova Richiesta», «Trova candidati» = rosa ordinata per compatibilità (idoneo se ha TUTTE le competenze minime; punteggio con preferenziali, dossier validato, documenti completi, fase), badge di validazione, «Abbina» aggiorna datore di lavoro del candidato + log su entrambi; Rimuovi abbinamento / Chiudi / Riapri / Elimina.
- **Ruoli operativi per team** (`canOperatePhase`, `canManageMatching`): operatore con team assegnato lavora SOLO le fasi del suo team (checklist disabilitate + avviso azzurro + Avanza Fase bloccato sulle fasi altrui); il matching (richieste e abbinamenti) è del Team Italia. Admin e operatori SENZA team = accesso pieno (retrocompatibile). Solo UI, non regole Firestore.
- Manuale aggiornato (nav + sezione 6.1 «protocollo di matching tecnico») in IT/EN/ES. Testato in demo locale su :4610 con entrambi i team simulati (`dhl.operator.name` + demoRole operator). ApiKey ripristinata, build ok.

### Sessione 11 lug 2026 (pomeriggio) — NUOVA STRUTTURA A 9 FASI (non ancora deployata)

Implementata la struttura di «struttura progetto.md»: il workflow è passato da **11 stati a 9 fasi divise in 2 team**:
- **Team Rep. Dominicana (fasi 1-4)**: Selezione e Reclutamento · Gestione Documentale · Formazione · Organizzazione Viaggio
- **Team Italia (fasi 5-9)**: Arrivo in Italia · Domicilio e Servizi · Matching · Rapporto di Lavoro · Tutor e Assistenza
- La pratica è "completata" avanzando oltre la fase 9 (`currentStep = 10`, costante `DONE_STEP`).
- **Migrazione automatica** dei dati esistenti in `normalizeState()`: rileva le pratiche vecchio formato (checklist con chiavi 10/11) e mappa gli step: 1→1, 2-7→2, 8-9→4, 10→5, 11→completata; le checklist vengono ricostruite sui nuovi modelli (fasi precedenti spuntate, fase corrente da rifare).
- Gate documentale unificato sulla fase 2 (tutti i doc richiesti caricati E approvati per uscirne).
- KPI "In attesa OPI" → "In Matching" (fase 7); badge "Visto Ottenuto" riusato come "Fase Italia" (fasi 5-9); "Trasferiti" = fase ≥ 5.
- Stepper e distribuzione dashboard con bande colorate dei due team (🇩🇴 sky / 🇮🇹 emerald); manuale in-app riscritto (sez. 6 con tabella fasi per team, nota "una tantum vs operativo") in IT/EN/ES; checklist per fase trilingue nuove in `i18n-data.js`.
- Gli accordi quadro UNA TANTUM (agenzie, alloggi, aziende, professionisti) NON stanno nelle checklist per candidato: solo attività OPER.
- Testato su :4610 (config launch `nurseflow-4610` aggiunta perché 4599 era occupata da un'altra sessione), inclusa la migrazione con dati finti vecchio formato. ApiKey ripristinata, build ok.

**Gestione team operatori** (stessa sessione):
- Impostazioni → Operatori HR: nuovo campo **Team** (— / Rep. Dominicana / Italia), mostrato nella lista operatori, nel menù "Referente HR" del form candidato e nella scheda Contatto del candidato (es. «Dott. Bianchi · 🇮🇹 Team Italia»).
- Filtro **«Il mio team»** in Gestione Pratiche: compare solo se l'operatore corrente ha un team; mostra i candidati nelle fasi del suo team (completati esclusi). Abbinamento operatore: per email in cloud (`currentOperator()`), per nome operatore locale (`dhl.operator.name`) in demo. Se il team non è assegnato il filtro è inerte (mostra tutto).
- Backfill `team:''` sugli operatori salvati in `normalizeState()`. Demo seed: Ferraro=rd, Bianchi=it. Manuale §5.1 aggiornato (IT/EN/ES).
- Sono etichette organizzative, NON permessi: tutti vedono e modificano tutto (permessi per team = eventuale evoluzione futura, richiederebbe regole Firestore).

### Sessione 11 lug 2026 (mattina) — tutte online

1. **Avvio mobile**: splash screen, niente flash del login (gate `authResolved`), render immediato da cache locale con refresh Firestore in background, service worker offline, safe-area iPhone.
2. **Guida Normativa** in-app (overlay con TOC, note→fonti, stampa) tradotta IT/EN/ES.
3. **Anagrafica estesa e a 3 schede**: Dati anagrafici (nascita, nazionalità, stato civile, indirizzo, passaporto+scadenza, cédula+scadenza — scadenze a semaforo), Contatto (tel, email, agenzia, datore, referente HR), Competenze (ruolo, settore, durata esperienza + lingua). Campo "Origine" eliminato (migrato in luogo di nascita).
4. **Documenti personali** con upload diretto dalla scheda: Passaporto, Cédula, Consenso Privacy Firmato, Cert. Lingua = richiesti; Foto, CV, Cert. Penale, Cert. Sanitario = facoltativi (badge, non bloccano la pipeline).
5. **Privacy GDPR**: modulo bilingue IT/ES stampabile precompilato; l'upload del firmato registra il consenso con data + log.
6. **Tabella documenti**: anteprima (occhio), stato = dropdown colorato con aggiornamento immediato e log, "Elimina" al posto di "Respingi" sugli approvati, layout 3 colonne (non si taglia più).
7. **File senza Firebase Storage** (utente sul piano gratuito, NIENTE Blaze): chunk base64 ~0,7 MB in Firestore (`organizations/default/files/{fileId}_{i}`), foto compresse client-side (max 1800px JPEG), cap ~4 MB, anteprima ricompone i blocchi, pulizia automatica dei chunk su sostituzione/eliminazione.

## 4. ⚠️ Cose in sospeso / da verificare a inizio sessione

- [ ] **Regole Firestore da ripubblicare in console** (Firestore → Regole → incolla `firestore.rules` → Pubblica): senza, gli upload in produzione vengono annullati con avviso nel log. CHIEDERE se è stato fatto.
- [ ] Verificare che `itavix.github.io` sia negli **Authorized domains** di Firebase Auth (serve per il login Google dal sito pubblicato).
- [ ] Eventuali dati con file base64 incorporati caricati PRIMA del passaggio ai chunk: se la sync del team desse problemi di dimensione, migrare/ricaricare quei file.
- [ ] Modulo privacy: il punto "1. Titolare del trattamento" è generico — inserire ragione sociale/contatti reali quando l'utente li fornisce.

## 5. Come lavorare con questo utente (imparato sul campo)

- **Batch dei deploy**: se ci sono modifiche pronte E una domanda aperta, chiedere PRIMA e fare UN solo commit+deploy (feedback esplicito dell'utente).
- **Verifica UI post-login senza credenziali**: svuotare temporaneamente `apiKey` in `src/app.js` (→ demo locale, niente login), `npm run build`, testare su :4599, poi RIPRISTINARE la chiave prima del commit (`grep -c AIzaSy src/app.js` deve dare 1). La chiave è nel file, valore in git history.
- **Browser preview**: misure DOM inaffidabili subito dopo un render e screenshot bianchi dopo scroll programmatico → rimisurare su DOM stabile / usare elementFromPoint.
- **Dati salvati**: ogni nuovo campo nurse va aggiunto a `PERSONAL_FIELDS` + backfill in `normalizeState()`; nuovi doc-slot in `PERSONAL_DOC_TYPES` (flag optional sincronizzati automaticamente sugli stati salvati).
- **Tailwind compilato**: mai costruire classi per concatenazione; solo stringhe complete.
- L'utente scrive in italiano, non è sviluppatore: spiegazioni operative chiare, niente gergo; i passaggi in console Firebase/GitHub li fa lui su istruzioni puntuali.
- Memoria persistente di Claude: vedi `memory/dominicahealthlink-app.md` e `feedback-batch-deploys.md`.

## 6. Idee non ancora richieste (possibili prossimi passi)

- Riportare nella demo le feature nuove del gestionale (schede anagrafica, ecc.)
- Notifiche scadenze documenti (passaporto/cédula ora hanno le date)
- Export PDF della scheda candidato
- Migrazione dal SDK Firebase compat al modulare (bundle più piccolo)
