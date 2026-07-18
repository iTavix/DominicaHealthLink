# DominicaHealthLink / DHL Nurses — Handoff sessione

> File di contesto per aprire una nuova sessione di lavoro con Claude.
> Aggiornato: 12 luglio 2026 (sera). Incolla o referenzia questo file all'avvio:
> *"Leggi DominicaHealthLink/SESSIONE-HANDOFF.md e continua da lì: voglio [obiettivo]."*

---

## 1. I due progetti

| | Produzione | Demo presentazioni |
|---|---|---|
| Cartella | `~/Desktop/claude_code/DominicaHealthLink` | `~/Desktop/claude_code/demo_dhl_nurses` |
| Repo | github.com/iTavix/DominicaHealthLink | github.com/iTavix/dhl-nurses-demo (pubblico) |
| Live | itavix.github.io/DominicaHealthLink/ | itavix.github.io/dhl-nurses-demo/ |
| Brand | **DHL Nurses** (dal 12 lug; cartella/repo/URL restano DominicaHealthLink) | **DHL Nurses** |
| Backend | Firebase Auth + Firestore (workspace condiviso) | Nessuno: demo locale permanente (apiKey vuota) |

**Deploy**: push su `main` → GitHub Action builda Vite e pubblica `dist/` su Pages (~1 min). Mai caricare file dall'interfaccia web di GitHub. Credenziali git nel portachiavi macOS (token con permessi Contents+Workflows).

**La demo è una copia divergente**: le feature nuove del gestionale NON ci arrivano da sole — vanno riportate (patch del diff di produzione + adattamenti). La demo ha in più: welcome page a schermo intero (logo, claim, carosello 6 slide con anteprime SVG delle schermate), 6 candidati fittizi (fasi 2,3,4,6,7,completata), banner da presentazione. ⚠️ Il suo `styles.css` ha stili esclusivi (#welcome-overlay, .wl-slide, .wl-dot): MAI sovrascriverlo con quello di produzione (il 12 lug ha rotto la welcome). Al 12 lug sera demo e produzione sono ALLINEATE su tutto.

## 2. Stack e struttura (identica nei due repo)

- Vite 6 + Tailwind 3 compilato + lucide + firebase compat 10.12.2 (versioni bloccate in package.json)
- `index.html` (shell + splash) · `src/app.js` (tutta la logica, ~3400 righe) · `src/i18n-data.js` (IT/EN/ES) · `src/guide-content.js` (guida normativa, sync manuale col .md alla radice) · `src/styles.css` · `public/sw.js` (service worker)
- Comandi: `npm run dev` / `build` / `preview` (preview prod: porta 4599 = launch `nurseflow`; demo: 4601 = `dhldemo`)

## 3. Funzionalità implementate

### Sessione 15 lug 2026 (2ª parte) — Audit completo di correttezza: 6 fix + 3 scelte utente (prod+demo, ONLINE)

Audit a due binari (test manuali UI di ogni inserimento + review agente di tutto il codice). Esito: impianto solido, 412 chiavi i18n identiche nelle 3 lingue, dispatcher senza orfani, sync/merge verificato in dettaglio. Trovati e corretti (commit prod b67b261):
1. **🔴 Employer cancellato silenziosamente** — dati seed con employer «nome» semplice vs catalogo «nome · città»: select vuoto in Modifica (anagrafica E richiesta), salvataggio sovrascriveva il datore col default. Fix doppio: `selectField` conserva valori fuori catalogo (aggiunti come option) + **migrazione in normalizeState** che riallinea employer di nurse/request alla label composta (solo match univoci).
2. `f_last` mancante (scheda stampabile mostrava la chiave grezza) → aggiunta IT/EN/ES.
3. `openDocOverlay` non chiudeva la Scheda → overlay sovrapposti in stampa. Fix: `closeNurseSheet()` in catena.
4. Backup senza `languageLevel` → crash del render (`.split` su undefined). Fix: backfill in normalizeState.
5. **Riconciliazione referenziale** in normalizeState: abbinamenti verso richieste/candidati inesistenti (backup, merge parziali) ripuliti; stato open/matched riallineato; matchedRequestId azzerato anche se non speculare in `r.matched`. Testato iniettando dati corrotti.
6. Guardie `if (!n) return` su getNurse in tutte le mutazioni (candidato cancellato da altro operatore + DOM stantìo).

Scelte utente implementate:
- **(a) Archivio**: righe VIRTUALI per scadenze passaporto/cédula (`allDocs`, badge «Dati anagrafici», niente azioni file), nei filtri Tutti/In scadenza → KPI e archivio ora coerenti.
- **(b) Impostazioni multi-admin**: merge per-entità (`SETTINGS_COLLECTIONS`, `lastSynced.settings` per-record al posto di `settingsJson`) — stesso schema di nurses/requests; due admin non si sovrascrivono più. NON testabile end-to-end in locale (demo senza cloud): verificato build+logica, da provare col secondo operatore reale.
- **(c) Rimozione abbinamento / eliminazione richiesta**: `n.employer` torna «Non assegnato» SOLO se coincideva con quello della richiesta (una modifica manuale post-abbinamento non viene toccata).

Non fixato (riportato): reset di `sizeWarnShown`, disconnect di un IntersectionObserver del TOC (trascurabili).

### Sessione 15 lug 2026 — Welcome demo a 12 fasi + coerenza presentazione (SOLO demo, ONLINE)

- **Welcome/landing di app.html aggiornata al modello a 12 fasi** (era rimasta a «9 fasi»): titolo «Percorso guidato: 12 fasi, 2 team», testo e popup «Scopri di più» riscritti col racconto **12 = 3 accordi quadro «una tantum» (associazioni, aziende ospedaliere, alloggi/servizi) + 9 fasi operative per candidato**, in IT/EN/ES. Anteprima SVG della sezione: aggiunta fascia viola «3× ACCORDI QUADRO · UNA TANTUM» sopra i 9 nodi (3+9=12).
- Stepper e tour ora dicono «9 fasi **operative**» (stepper_title, tour2, tour5 nelle 3 lingue): resta vero rispetto al software e si aggancia al racconto a 12 fasi.
- **Presentazione (index.html) ripulita**: brand normalizzato «DHLNurses»→«DHL Nurses» (34 occorrenze), stat hero «12 Fasi operative»→«12 Fasi end-to-end» (le operative sono 9, il deck stesso marca 3 fasi UNA TANTUM), chip hero-card 10 «Arrivo & tutor»→«Arrivo, domicilio & tutor» (condensa le fasi 10-12), commento i18n aggiornato. Verificato: dizionari IT/EN/ES completi (116 chiavi ciascuno), link ./app.html ok, logo società PNG presente, nessun errore console.
- **✅ DIVERGENZA RISOLTA (decisione utente, 15 lug 2026)**: il protocollo a 12 fasi È definitivo ma **NON impatta il gestionale** — le 3 attività aggiuntive sono gli **accordi quadro una tantum con le associazioni/aziende/alloggi** e NON saranno gestite dal software. Il gestionale resta sulle **9 fasi operative per candidato col Matching in fase 7** (coerente col box «Una tantum vs operativo» già presente nel manuale §6). Nessun riordino del workflow da fare. Nota residua: l'ORDINE mostrato nella hero-card della presentazione investor (matching/contratto prima dell'arrivo) è una scelta narrativa del deck, non un requisito per il software.
- Build ok, testato su :4601 nelle 3 lingue. Deployato col commit b12c9d3 (Action verde, live verificato via curl: «Fasi end-to-end» presente, zero «DHLNurses»).

### Sessione 14 lug 2026 — Logo piattaforma cuore SVG (prod+demo, ONLINE) + ⚠️ nuova architettura demo

- **⚠️ SCOPERTA — la demo è cambiata fuori sessione** (4 commit del 14 lug, altra sessione/lavoro utente): l'ingresso della demo è ora una **presentazione investor** (`index.html` riscritto, 12 fasi, nav Problema/Soluzione/…); il gestionale si è spostato su **`app.html`** (vite.config con 2 entry). Brand chiarito nel commit 18521bd: **DominicaHealthLink = società** (logo PNG quadrato), **DHL Nurses = piattaforma** (nuovo logo cuore). La presentazione referenzia `/src/logo_dhl_nurses.png` come logo società: quel PNG NON va rimosso dal repo demo (rimosso per errore durante il cambio logo, poi ripristinato).
- **Nuovo logo piattaforma**: `logo_dhl_nurses_cuore.svg` (732 byte, tegola indigo arrotondata + cuore-battito bianco, fornito dall'utente nella cartella demo) copiato in `src/` di entrambi i repo; import in app.js aggiornato. L'SVG è già una tegola → **rimossi i riquadri bianchi** nei contenitori: header (img h-10 rounded-xl diretta), login (h-14 rounded-2xl), demo welcome bar (h-9) e hero (h-28/36 rounded-3xl). Vite lo inlina come data-URI. In produzione `src/logo_dhl_nurses.png` eliminato (non più referenziato); l'originale 1254px resta alla radice.
- Verificato in entrambi i temi (prod header/login, demo presentazione + app.html landing), nessun errore console.
- NB porta 4599 occupata da un processo esterno (probabile altra sessione): usata la config `nurseflow-4610` per i test.

### Sessione 13 lug 2026 (2ª parte) — Guida Normativa: sezione privacy Italia+Rep. Dominicana (prod+demo, ONLINE)

- Nuova §10 «Protezione dei dati personali (Italia e Repubblica Dominicana)» in `src/guide-content.js`, nelle 3 lingue: copre la **Ley 172-13** dominicana (principi, diritti ARCO, habeas data, e il limite pratico — nessuna autorità di controllo indipendente dedicata, solo la Superintendencia de Bancos per i dati creditizi) e il regime italiano (**GDPR** + **Codice Privacy D.Lgs. 196/2003**/101/2018). Terza parte: la Rep. Dominicana **non ha una decisione di adeguatezza UE** (verificato via ricerca web, lista 2026 non la include) → il trasferimento dati si fonda sulle deroghe dell'**art. 49 GDPR** (consenso esplicito + misure precontrattuali), il che spiega perché il modulo di Consenso Privacy dell'app è la base giuridica del trasferimento, non solo buona prassi.
- Aggiunte 6 fonti verificate (numerate 10-15 in `REFS`): testo ufficiale Ley 172-13 (Presidencia), RIPD (principi/ARCO/habeas data), GDPR su EUR-Lex, Codice Privacy coordinato (Garante), pagina Garante sui trasferimenti extra-UE, lista adeguatezza Commissione Europea.
- Rinumerate le sezioni successive: Riferimenti operativi 10→11, Conclusioni 11→12, Fonti 12→13 (TOC + h2 + refsHtml, in IT/EN/ES).
- Verificato in browser: nessun errore console, sezione e note a piè pagina renderizzate correttamente in tutte e 3 le lingue, sia in produzione che in demo (patch identica applicata pulita).
- ⚠️ Non è consulenza legale: la sezione ha lo stesso taglio informativo del resto della guida (fonti ufficiali citate, nessun parere specifico). Se l'utente chiede dettagli operativi (es. clausole contrattuali standard, DPO da nominare) va indirizzato a un legale.

### Sessione 13 lug 2026 — KPI richieste in dashboard (prod+demo, ONLINE)

- Due nuove card KPI cliccabili in Dashboard → vista Matching: **«Richieste da Evadere»** (richieste `open`, sottotitolo coi posti ancora da coprire = somma quantity−matched) e **«Richieste Evase»** (`matched`+`closed`). `computeKpis` ora restituisce anche reqOpen/reqDone/reqSeats. Griglia KPI passata a `xl:grid-cols-4` (7 card = 4+3). Chiavi `kpi_req_*` IT/EN/ES; manuale §4.2 aggiornato nelle tre lingue. Verificato in prod locale (1/1, 2 posti) e demo (3/1, 3 posti — coerente col seed a 4 richieste).

### Sessione 12 lug 2026 (notte, 5ª parte) — Manuale in-app aggiornato a v1.1 (prod+demo, ONLINE)

- Aggiornati i tre corpi del manuale (`manualBodyIT/EN/ES`) + versione header `manualHtml` (v1.0→v1.1), in produzione e demo (patch identica applicata pulita, il manuale era allineato).
- Aggiunto in §1 un riquadro verde **«Novità di questa versione»** che elenca tutte le aggiunte recenti con rimando alla sezione. Aggiornati inoltre: §3 tabella interfaccia (riga «Stato salvataggio», riga «Ripristina» = solo demo, Guida navigabile con frecce), §4.3 (scadenze passaporto/cédula), §5.1 (ricerca estesa), §6.1 (alert richieste), §7 procedura 1 (validazioni) + «Altre funzioni utili» (Scheda PDF, Backup), nuova §8.1 «Lavoro in team e stato del salvataggio», FAQ (gating documenti, indicatore rosso, Ripristina solo demo).
- ⚠️ Il manuale è scritto come manuale DEL PRODOTTO: descrive anche sync/cloud/save-chip che nella demo (locale) non si attivano — coerente col fatto che la demo mostra le capacità del gestionale reale.
- Nulla ancora in sospeso sul manuale.

### Sessione 12 lug 2026 (notte, 4ª parte) — Frecce guida + footer sticky (prod+demo, ONLINE) + dati matching demo

- **Frecce tastiera nel tour «Guida»** (prod commit b3b8794, demo 30103ae): nel gestore keydown, se `tour.active` e nessuna modale → →/↓ `tourNext()`, ←/↑ `tourPrev()` (con preventDefault). NB: il tasto del tool browser di test non arriva alla pagina; verificato via dispatch reale (start→2× ArrowRight = passo 3, ArrowLeft = passo 2).
- **Footer sempre in fondo**: `#app` reso colonna flex `min-height:100vh` (styles.css), il body avvolto in `<div class="dhl-main">` con `flex:1 0 auto`; footer `flex-shrink:0`. Risolve il footer «a mezz'aria» nelle viste corte (es. Matching con una sola scheda). Applicato a prod E demo.
- **Demo — dati fittizi nel matching**: seed `requests` ora 4 richieste: Padova (Terapia Intensiva, qty 2, **1/2** con Carlos), San Raffaele Milano (Nefrologia e Dialisi, qty 1, **Abbinata** con Rosa), Bologna S.Orsola (Sala Operatoria, aperta), Firenze Meyer (Pediatria, aperta). Pre-abbinati coerenti: `carlos.matchedRequestId='req_padova_ti'`, `rosa.matchedRequestId='req_sr_dialisi'` (employer già coincidenti). ⚠️ Per vedere il nuovo seed serve azzerare il localStorage o usare «Ripristina dati demo» (i test avevano dati vecchi salvati).

### Sessione 12 lug 2026 (notte, 3ª parte) — Alert richieste (prod, ONLINE) + Demo rifatta (ONLINE)

**Produzione** — Alert sulle richieste di matching (commit 9cbe870, deployato):
- Toast «📋 Nuova richiesta» alla creazione e «✅ Richiesta soddisfatta» quando l'organico è al completo (in `assignMatch` e in `saveRequestFromForm` per la modifica quantità).
- `alertRemoteRequestEvents` in `applyRemoteCases`: stessi due avvisi quando l'evento arriva da un ALTRO operatore via sync (max 2 toast per snapshot). Chiavi `toast_req_*` IT/EN/ES.

**Demo** (`demo_dhl_nurses`, repo dhl-nurses-demo, deployata):
- ⚠️ SCOPERTA: la demo era un **fork più vecchio** — non aveva l'intero sottosistema file-storage Firestore + dropdown stato documenti di produzione (assenti anche nel backup). «Parità completa» reinterpretata come parità delle FUNZIONI VISIBILI; saltato il back-end Firestore inerte in demo (nessun login/DB).
- Portate: alert richieste, scheda candidato PDF, scadenze anagrafiche in dashboard, backup dati, validazioni email/passaporto, integrità riferimenti (rinomina+uso), autore reale nei log, gating documenti per team, ricerca estesa, log revoca privacy, potatura log, cleanup abbinamenti su delete. Adattate al modello file più semplice della demo (documentManager senza dropdown; rejectDoc/approveDoc diversi). Rimosso Firebase Storage.
- **Welcome → landing a scorrimento**: `LANDING_SECTIONS` (8 sezioni), hero + sezioni animate allo scroll (IntersectionObserver + classi `.wl-reveal/.in` in styles.css), layout alternato, anteprime SVG riusate da `welcomePreview` (aggiunte wl_s7 alert e wl_s8 PDF), pulsante «Scopri di più» → popup `#wl-detail` con dettagli (chiavi `ld_s1..s8`), barra avanzamento scroll, CTA finale, trilingue, responsive (lang sempre visibile, verificato mobile). Testato su :4601, apiKey vuota confermata.
- ⚠️ Gli stili `wl-slide/.wl-dot` del vecchio carosello restano in styles.css ma non più usati (innocui). La demo NON ha più sync/onSnapshot: è tutta locale.
- Manuale in-app (prod E demo) ancora da aggiornare con le novità — da fare quando l'utente vuole.

### Sessione 12 lug 2026 (notte, 2ª parte) — Punti 6-17 del report (deployata, commit 503bec6)

- **Scadenze anagrafiche in dashboard**: passaporto/cédula in scadenza (entro 60 gg) ora entrano in `computeExpiring` → pannello «Documenti in scadenza» e KPI (voci virtuali con etichette f_passport_exp/f_cedula_exp; il clic apre la pratica; la vista Archivio invece mostra solo i file veri).
- **Gating team esteso ai documenti**: approvazioni, respinte, cambio stato, upload, eliminazione file e aggiunta documento rispettano `canOperatePhase` (guardie nelle funzioni + UI: select disabilitati, pulsanti nascosti, avviso azzurro in tabella). Admin e operatori senza team = pieno accesso, come prima.
- **Validazioni**: email (formato) su candidato e operatore (l'email operatore finisce nella access map: un refuso = accesso rotto), passaporto duplicato bloccato con nome del titolare esistente (case-insensitive).
- **Integrità referenziale**: rinominare agenzia/datore/operatore aggiorna le stringhe su pratiche e richieste (`propagateEntityRename`; per i datori l'etichetta è «nome · città» — `entityRefLabel`); eliminare una voce usata avvisa con il conteggio d'uso (`entityUsageCount`, anche specializzazioni).
- **Backup completo** (Impostazioni, admin): esporta JSON di candidati+richieste+impostazioni; ripristino da file con doppio avviso (sostituisce tutto; i file caricati restano nel cloud, nel backup ci sono solo i riferimenti).
- **Scheda Candidato stampabile** (pulsante «Scheda» accanto a Modifica anagrafica): overlay `#sheet-overlay` con anagrafica, contatti, competenze, stato/fase, tabella documenti e ultime 10 voci di log; Stampa/PDF via window.print (CSS print aggiornato in styles.css, sempre a colori chiari).
- **«Ripristina dati demo» eliminato in cloud** (pulsante nascosto + guardia in resetData): esiste solo nella demo locale.
- **GDPR**: la revoca del consenso privacy ora viene loggata (log_privacy_revoked). Il titolare del trattamento nel modulo resta placeholder: SERVONO ragione sociale/sede/contatti dall'utente.
- **Minori**: chunk di file orfani ripuliti se l'upload fallisce a metà; guardia CSV injection (celle che iniziano con = + - @); ricerca pratiche estesa (anche agenzia, referente HR, luogo di nascita, specializzazioni); rimossi Firebase Storage (import, init, vite manualChunks, storage.rules, firebase.json) e la chiave i18n morta set_operators_desc2.
- Nuove chiavi i18n: err_email_invalid, err_passport_dupe, confirm_delete_used, log_privacy_revoked, sheet_*, backup_* (IT/EN/ES).
- Testato in demo locale su :4599 (KPI scadenze, duplicato, email, rinomina datore con propagazione, scheda, blocco team con Bianchi/operator). ApiKey ripristinata, build ok.
- Manuale in-app NON ancora aggiornato (chip sync + tutte le novità): da fare a fine giro modifiche, come concordato con l'utente.

### Sessione 12 lug 2026 (notte) — Logo + robustezza sync multi-operatore (non ancora deployata)

Corretti i punti 1–5 del report "cosa manca" (vedi log conversazione):
- **Logo ufficiale** (`src/logo_dhl_nurses.png`, 512px, importato con nome hashato come in demo) al posto del cuoricino lucide nell'header e nella schermata di login. Originale 1254px alla radice del progetto.
- **Sync in tempo reale** (`attachRealtimeSync`, `onSnapshot` su cases+settings): le modifiche di un operatore arrivano subito agli altri. **Merge per-record** (`mergeRecords` + mappa `lastSynced` di stableJson): niente più sovrascrittura dell'intero array; conflitto sullo STESSO candidato = vince l'ultimo (per-record), candidati diversi = entrambe le modifiche sopravvivono. Delete propagate; modifica batte delete (conservativo). Logica testata con 8 scenari standalone in Node. Il re-render da dati remoti è "sicuro" (`safeRemoteRender`): rinviato se c'è una modale aperta, il tour attivo o un campo col focus.
- **Chip stato sync nell'header** (solo cloud): verde Salvato / ambra Salvataggio… / rosso NON salvato (clic = dettaglio errore + retry) / grigio Offline. Toast (`showToast`) su errori di salvataggio, aggiornamenti ricevuti da altri operatori (throttle 30s) e archivio quasi pieno. Eventi window online/offline collegati.
- **Eliminazione candidato** ora libera i posti nelle richieste di matching (`deleteNurse` pulisce `r.matched`, richiesta piena → torna Aperta). Verificato in demo locale.
- **Autore reale nel log**: `actorName()` (operatore corrente per email in cloud, nome locale in demo) sostituisce "Sistema"/referente HR in TUTTI i pushLog (approvazioni, avanzamenti, abbinamenti, note, creazione candidato). Verificato in demo.
- **Cap log**: max 80 voci per candidato (`MAX_LOG_ENTRIES`, potatura in pushLog + normalizeState) + avviso toast quando il doc condiviso supera ~850 KB (limite Firestore 1 MiB).
- Nuove chiavi i18n `sync_*` in IT/EN/ES.
- **Trasloco hosting futuro** (Firebase RESTA): la build è già portabile (`base: './'` in vite.config, manifest/SW relativi). Al cambio dominio servirà SOLO: (1) Firebase console → Authentication → Settings → Authorized domains → aggiungere il nuovo dominio; (2) pubblicare `dist/` sul nuovo hosting. Nessuna modifica al codice.
- NOTA: il manuale in-app NON documenta ancora il chip di sync (da fare in un prossimo giro se richiesto).

### Sessione 12 lug 2026 (sera) — Brand, UI e Guida (tutto online)

- **Brand «DHL Nurses»** anche in produzione: header, login, splash, titolo pagina, manifest PWA, manuale/guida IT-EN-ES.
- **Dashboard**: chip col nome dell'operatore al lavoro + team (da Operatori HR via email; nome locale in demo) accanto a Esporta CSV.
- **Tema scuro sistemato**: override CSS per le tinte accento (indigo/emerald/amber/rose/sky: testi -600/700/800, fondini -100, ring, bordi, bg-white/70) — prima chips/badge/bande team erano verde-su-verde e blu-su-blu. Tema chiaro invariato. Ogni NUOVO componente colorato va verificato in entrambi i temi.
- **Tour interattivo a 10 passi**: testi arricchiti e Matching integrato come passo 6 (dopo il racconto delle 9 fasi, con frasi di raccordo), non più in coda; salto di vista Gestione Pratiche → Matching → ritorno.
- **Manuale**: sezione 6.1 con «Come viene costruita la rosa» (pool, idoneo/parziale, punteggio 100/60 +8 +5 +4, stati richiesta), procedura 7 passo-passo del matching, 2 FAQ nuove; §2 riscritto coi tre modi di accesso.
- **Demo**: welcome page ripristinata (era sparita per il CSS sovrascritto) + anteprime SVG inline delle schermate nelle 6 slide; logo nuovo (cuore tricolore) importato da src/ con nome hashato = niente cache stantia.
- Creato **PROGETTO-CLAUDE-DHL-NURSES.md** (nella cartella): istruzioni + conoscenza per un Progetto su claude.ai. Non ancora committato.


### Sessione 12 lug 2026 (pomeriggio) — Account gestiti dall'app (⚠️ RIPUBBLICARE LE REGOLE)

- **Niente più script/claim per i nuovi utenti**: le regole Firestore ora autorizzano anche chi ha l'email nel documento `organizations/default/data/access` = { emails: { "email": "admin"|"operator" } }, che l'app scrive AUTOMATICAMENTE (solo admin) a ogni modifica degli Operatori HR (in remoteSync). I custom claims restano validi come override (l'admin storico continua a funzionare ed è il bootstrap del documento access).
- **⚠️ AZIONE UTENTE**: ripubblicare `firestore.rules` in console (Firestore → Regole → incolla → Pubblica). Senza, i nuovi operatori senza claim non leggono nulla. CHIEDERE se fatto.
- **«Crea account» in Impostazioni → Operatori** (icona 🔑, solo admin+cloud, serve email nella scheda): modale con password provvisoria, crea l'utenza Firebase Auth via app secondaria (`firebase.initializeApp(config, 'acct_...')`) senza toccare la sessione dell'admin. Email già esistente = ok (l'operatore accede direttamente).
- **«Password dimenticata?»** sulla schermata di login (sendPasswordResetEmail).
- Flussi possibili per un nuovo operatore: (a) admin crea l'account e consegna la password provvisoria; (b) auto-registrazione col pulsante Registrati usando la STESSA email della scheda; (c) Google con quella email. In tutti i casi l'accesso è deciso dall'elenco Operatori HR.
- Manuale §2 riscritto (IT/EN/ES). Lo script `scripts/set-admin-claim.js` resta come via d'emergenza ma non è più necessario.
- NOTA rinomina operatori: cambiare il NOME di una scheda non aggiorna il campo `hrReferent` dei candidati esistenti (stringa semplice): va corretto sulle singole pratiche.

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

- [x] Regole Firestore con access map ripubblicate in console + scheda operatore risalvata: confermato dall'utente il 12 lug (sera).
- [ ] La sync in tempo reale coi due operatori REALI non è mai stata provata in produzione (testata solo la logica di merge in locale): alla prima occasione aprire l'app su due dispositivi/finestre loggati e verificare che le modifiche si vedano a vicenda e che il chip resti verde.
- [ ] Verificare l'accesso reale di un nuovo operatore (creato col pulsante 🔑 o auto-registrato): mai testato end-to-end in produzione.
- [ ] Modulo privacy: il punto "1. Titolare del trattamento" è generico — inserire ragione sociale/contatti reali quando l'utente li fornisce.
- [ ] `PROGETTO-CLAUDE-DHL-NURSES.md` non è committato: includerlo nel prossimo giro di deploy se l'utente vuole versionarlo.
- [x] Authorized domains e prime regole Firestore: confermati fatti dall'utente l'11-12 lug.
- Nota: eventuali file base64 incorporati caricati PRIMA del passaggio ai chunk — migrare/ricaricare solo se la sync del team desse problemi di dimensione.

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
