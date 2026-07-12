# DHL Nurses — File di progetto per Claude

> **Come usare questo file su claude.ai**
> 1. Vai su claude.ai → **Projects** → **Create project** → chiamalo "DHL Nurses".
> 2. Copia la **PARTE A** qui sotto nel campo **Project instructions** (Imposta istruzioni personalizzate).
> 3. Carica questo intero file nella **Project knowledge** (trascinalo tra i documenti del progetto).
> 4. Utile caricare anche: `SESSIONE-HANDOFF.md` e `struttura progetto 2.0 2.md` (nella cartella DominicaHealthLink).

---

# PARTE A — Istruzioni del progetto (da incollare in "Project instructions")

Sei l'assistente tecnico del progetto **DHL Nurses**: un gestionale web che accompagna infermieri dalla Repubblica Dominicana alle strutture sanitarie italiane. L'utente (Claudio) **non è uno sviluppatore**: parla italiano, spiega in modo operativo e senza gergo; i passaggi su console Firebase/GitHub li fa lui su istruzioni puntuali.

Regole di lavoro consolidate:
- **Deploy in batch**: prima di ogni deploy elenca le lacune note e le domande aperte, chiedi conferma, poi UN solo commit+push per repo. Mai due deploy consecutivi evitabili.
- Esistono **due app gemelle**: produzione (`DominicaHealthLink`, privata, con Firebase) e demo (`dhl-nurses-demo`, pubblica, senza backend). Ogni modifica alla produzione va valutata anche per la demo, nello stesso giro.
- Il brand visibile è **DHL Nurses** ovunque; cartelle, repo e URL restano "DominicaHealthLink" / "dhl-nurses-demo".
- L'utente è sul piano Firebase **gratuito** (niente Blaze): mai proporre Firebase Storage o Cloud Functions.
- Tailwind è compilato: mai costruire classi CSS per concatenazione, solo stringhe complete.
- Tutta l'interfaccia è trilingue **IT/EN/ES**: ogni testo nuovo va aggiunto nelle tre lingue in `src/i18n-data.js`.
- Ogni nuovo campo del candidato va aggiunto a `PERSONAL_FIELDS` + backfill in `normalizeState()`.
- Consulta il documento di conoscenza "DHL Nurses" caricato nel progetto per architettura, modello dati e dettagli.

---

# PARTE B — Documento di conoscenza

## 1. Che cos'è il progetto

**DHL Nurses** è il gestionale ("case management system") di un progetto di mobilità sanitaria internazionale: selezione, qualificazione e trasferimento di infermieri dalla **Repubblica Dominicana** alle strutture sanitarie **italiane**, fino al pieno inserimento lavorativo. L'app è la **fonte unica di verità** che coordina i due team del progetto.

### L'organizzazione: 2 team, 9 fasi
Il progetto ha una divisione geografica e operativa netta (dal documento "struttura progetto 2.0"):

**🇩🇴 Team Repubblica Dominicana — fasi 1–4 (fino alla partenza)**
1. **Selezione e Reclutamento** — solo agenzie/cooperative riconosciute dal governo dominicano; verifica competenze e specializzazioni infermieristiche.
2. **Gestione Documentale** — la fase cruciale: titoli tradotti e asseverati, apostille, riconoscimento del Ministero della Salute, nulla osta, visto, iscrizione OPI. Non si avanza finché ogni documento richiesto non è caricato e approvato.
3. **Formazione** — contenuti digitali e incontri sul modello «Italia in tasca»; si chiude col dossier validato.
4. **Organizzazione Viaggio** — biglietto aereo e trasferimento all'aeroporto.

**🇮🇹 Team Italia — fasi 5–9 (dall'arrivo in poi)**
5. **Arrivo in Italia** — accoglienza in aeroporto, trasferimento all'alloggio.
6. **Domicilio e Servizi** — contratto individuale di alloggio (su contratti quadro), servizi, permesso di soggiorno.
7. **Matching** — incrocio tra richieste degli ospedali e profili qualificati (cuore del protocollo).
8. **Rapporto di Lavoro** — datore di lavoro, contratto, welfare, controversie.
9. **Tutor e Assistenza** — tutor, servizi socio-culturali, assistenza legale/fiscale convenzionata.

Concetto chiave **UNA TANTUM vs OPER**: gli accordi quadro (convenzioni con agenzie, contratti quadro alloggi, contrattualizzazione preventiva delle aziende, convenzioni con professionisti) si stipulano una volta sola e NON stanno nelle checklist del candidato; le checklist contengono solo le attività operative ripetute per ogni pratica.

### Il protocollo di matching tecnico 2.0
- Il **Team Dominicana inserisce e qualifica**: specializzazioni cliniche verificate (da catalogo), documentazione asseverata, dossier «Italia in tasca».
- Il **Team Italia interroga ed estrae**: registra le richieste delle strutture (reparto di destinazione, **numero di infermieri richiesti**, competenze tecniche minime, specializzazioni preferenziali, turno) e interroga il database.
- **Rosa candidati**: entrano i candidati non già abbinati e non oltre la fase 7. «**Profilo idoneo**» = possiede TUTTE le competenze minime. Punteggio: idoneo 100 (parziale max 60 proporzionale), +8 per preferenziale, +5 dossier validato, +4 documenti completi, fase come spareggio.
- **Abbinamento**: aggiorna datore di lavoro del candidato + log; la richiesta resta Aperta finché tutti i posti non sono coperti (contatore a/b), poi diventa Abbinata; si Chiude a contratti firmati. ✕ sul singolo abbinato per rimuoverlo. Il matching NON avanza le fasi.

## 2. Le due applicazioni

| | **Produzione** | **Demo presentazioni** |
|---|---|---|
| Cartella locale | `~/Desktop/claude_code/DominicaHealthLink` | `~/Desktop/claude_code/demo_dhl_nurses` |
| Repo GitHub | `iTavix/DominicaHealthLink` (privato) | `iTavix/dhl-nurses-demo` (pubblico) |
| Live | itavix.github.io/DominicaHealthLink/ | itavix.github.io/dhl-nurses-demo/ |
| Backend | Firebase Auth + Firestore (workspace condiviso) | Nessuno: demo locale permanente (apiKey vuota) |
| In più | Login, account, sync team | Welcome page con carosello e anteprime SVG, 6 candidati fittizi, banner demo |

**Deploy**: push su `main` → GitHub Action builda Vite e pubblica `dist/` su Pages (~1 minuto). Mai caricare file dall'interfaccia web di GitHub. Credenziali git nel portachiavi macOS.

**La demo è una copia divergente**: le feature nuove NON ci arrivano da sole, vanno riportate (di solito con patch del diff di produzione + adattamenti a mano). Attenzione: la demo ha stili CSS esclusivi (`#welcome-overlay`, `.wl-slide`, `.wl-dot`) — mai sovrascrivere il suo `styles.css` con quello di produzione.

## 3. Stack tecnico

- **Vite 6 + Tailwind 3 compilato + lucide icons + Firebase compat 10.12.2** (versioni bloccate).
- File principali: `index.html` (shell + splash) · `src/app.js` (tutta la logica, ~4000 righe, vanilla JS) · `src/i18n-data.js` (dizionari IT/EN/ES) · `src/guide-content.js` (guida normativa) · `src/styles.css` · `public/sw.js` (service worker offline).
- Comandi: `npm run dev` / `build` / `preview`. Anteprime locali: produzione porta 4599/4610, demo 4601/4611.
- **PWA** con service worker: asset hashati cache-first, navigazioni network-first. Le immagini vanno importate da `src/` (nome hashato = niente cache stantia), MAI in `public/` con nome fisso.
- **Tema chiaro/scuro**: il dark è fatto con override CSS in `styles.css` che rimappano le classi Tailwind chiare (slate, bianchi e tinte accento indigo/emerald/amber/rose/sky). Ogni nuovo componente con colori va verificato in entrambi i temi.

## 4. Modello dati (stato dell'app)

- `state.nurses[]` — i candidati: anagrafica estesa (cedula, nascita, stato civile, contatti, **scadenze passaporto/cédula con semaforo**), `profRole/profSector/profExperience`, `specializations[]` (dal catalogo), `currentStep` (1–9, 10 = pratica completata), `checklist` per fase, `documents[]` (stati missing/pending/approved, flag `optional`), `relocation`, `logs[]` (audit trail), `matchedRequestId/matchedDepartment`, consenso privacy con data.
- `state.requests[]` — richieste delle strutture: employer, department, **quantity**, requiredSkills[], preferredSkills[], shift, notes, status open/matched/closed, `matched[]` = [{id, name, at}].
- `state.settings` — anagrafiche di base (solo admin): agencies, employers, **operators** (nome, ruolo, email, **team rd/it**, accessRole admin/operator), docTypes, **specialties** (catalogo clinico).
- **Firestore (workspace condiviso `organizations/default`)**: doc `data/cases` = {nurses, requests}; doc `data/settings` = {settings} (scrittura solo admin); doc `data/access` = {emails: {email→ruolo}} scritto automaticamente dall'app; collezione `files/` = documenti caricati come **chunk base64 ~0,7 MB** (niente Firebase Storage, piano gratuito), foto compresse client-side, cap ~4 MB.
- `normalizeState()` migra e backfilla TUTTO automaticamente (vecchi stati a 11 step → 9 fasi, richieste legacy a match singolo → multiplo, campi mancanti). Ogni nuova feature deve aggiungere lì il suo backfill.

## 5. Funzionalità implementate (luglio 2026)

- **Workflow a 9 fasi / 2 team** con bande colorate su stepper e dashboard, SLA per fase con semafori di rischio, avanzamento bloccato da checklist + documenti (gate documentale in fase 2).
- **Ruoli operativi per team**: un operatore col team assegnato lavora SOLO le fasi del suo team (checklist e Avanza Fase disabilitati sulle altre, con avviso); il matching è del Team Italia. Admin e operatori senza team = accesso pieno. È un vincolo di interfaccia, non delle regole Firestore.
- **Vista Matching**: richieste con numero posti, «Trova candidati» con rosa ordinata e badge di validazione, abbinamenti multipli tracciati nel log.
- **Anagrafica a 3 schede** (Dati/Contatto/Competenze) con fase corrente e consenso privacy accanto al nome; documenti personali caricabili dalla scheda; modulo privacy GDPR bilingue stampabile (l'upload del firmato registra il consenso).
- **Archivio Documenti** con anteprima in-app, scadenze monitorate (scaduti/entro 60 giorni), export CSV.
- **Dashboard**: KPI cliccabili (attive, doc mancanti, in matching, scadenze, completati), riepilogo trasferimenti per team, **nome operatore + team** visibile in alto.
- **Account gestiti dall'app**: l'elenco Operatori HR è la lista d'accesso (autorizzazione via access map nelle regole Firestore, i vecchi custom claims valgono come override); pulsante 🔑 **Crea account** (admin) con password provvisoria; «Password dimenticata?» sul login; filtro «Il mio team».
- **Tour interattivo a 10 passi** (il Matching è il passo 6, cucito dopo il racconto delle 9 fasi) + **Manuale Operatore** completo + **Guida Normativa** (visti, permessi, riconoscimento titoli), tutto IT/EN/ES.
- **Demo**: welcome page a schermo intero con logo, claim e carosello di 6 slide con anteprime SVG delle schermate; pulsante di ripristino dati.

## 6. Sicurezza e accessi

- Firebase Auth (email/password + Google), dominio `itavix.github.io` tra gli Authorized domains.
- Le **regole Firestore** (`firestore.rules`) sono il vero confine di sicurezza: operatori leggono/scrivono `cases` e `files`, solo admin scrive `settings` e `access`. Autorizzazione: custom claim `role` OPPURE email presente nella access map (gestita dall'app). Le regole vanno **ripubblicate a mano in console** a ogni modifica del file.
- Bootstrap storico: il primo admin ha il custom claim (script `scripts/set-admin-claim.js`, ora solo via d'emergenza).
- Flusso nuovo operatore: admin lo crea in Impostazioni → Operatori HR (email di login vera + team + ruolo) → account creato dall'admin col pulsante 🔑 o auto-registrazione con la stessa email o Google.

## 7. Procedure di sviluppo (imparate sul campo)

- **Verifica UI post-login senza credenziali**: svuotare temporaneamente `apiKey` in `src/app.js` (→ demo locale), `npm run build`, testare in preview, poi RIPRISTINARE la chiave prima del commit (`grep -c AIzaSy src/app.js` deve dare 1).
- **Porting produzione → demo**: generare il diff dei commit di produzione e applicarlo con `patch --fuzz=3`; attenzione agli hunk "già applicati" (patch può invertirli! controllare sempre `git diff` dopo) e alle parti divergenti della demo (welcome page, seed a 6 candidati, niente auth).
- **Cache/service worker**: dopo un deploy il browser può mostrare la versione vecchia; gli asset hashati si aggiornano da soli, per verifiche immediate disregistrare il SW e svuotare `caches`, o hard refresh.
- **Browser di test**: misure DOM inaffidabili subito dopo un render; i frame rAF non girano con tab in background (tour/animazioni sembrano rotti ma non lo sono).
- I documenti sorgente del progetto (`struttura progetto 2.0 2.md`, `SESSIONE-HANDOFF.md`) vivono nella cartella di produzione e vanno tenuti aggiornati.

## 8. Stato e sospesi

- Produzione e demo **allineate** su tutto (12 lug 2026): 9 fasi, team, matching 2.0, anagrafica estesa, brand DHL Nurses, tema scuro corretto, tour a 10 passi.
- ⚠️ **Regole Firestore con access map**: da ripubblicare in console se non già fatto (senza, i nuovi operatori non leggono i dati).
- Modulo privacy: il punto "Titolare del trattamento" è generico — inserire ragione sociale/contatti reali quando disponibili.
- Rinominare un operatore NON aggiorna il campo "Referente HR" delle pratiche esistenti (testo salvato): correggere sulle singole pratiche.
- Possibili prossimi passi mai richiesti: notifiche scadenze documenti, export PDF della scheda candidato, migrazione SDK Firebase compat → modulare.
