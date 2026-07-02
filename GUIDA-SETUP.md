# DominicaHealthLink · Guida al Setup (spiegata passo-passo)

> Questa guida è scritta per chi non ha **mai** configurato Firebase.
> Non serve essere programmatori: basta seguire i passaggi nell'ordine e leggere i riquadri 💡 che
> spiegano *perché* stai facendo una certa cosa. Prenditi con calma: la prima volta sono ~30 minuti.

> ⚠️ **Aggiornamento (luglio 2026):** il progetto è passato da un singolo `index.html` a una
> struttura con build (Vite). Due differenze rispetto a quanto scritto sotto:
> 1. il blocco `const FIREBASE_CONFIG = { ... }` ora sta in **`src/app.js`** (non in `index.html`);
> 2. per avviare l'app in locale si usa **`npm run dev`** (vedi `README.md`), non più il
>    mini-server Python. Tutto il resto della guida (console Firebase, regole, ruoli) resta valido.

---

## 0. Cosa stiamo per fare (in parole semplici)

Adesso l'app funziona già da sola in **"modalità demo"**: i dati restano solo nel tuo browser, su
quel computer. Va benissimo per provare, **ma non per dati veri**: non c'è login e nulla è condiviso
né salvato in un posto sicuro.

Per usarla con **dati reali** colleghiamo l'app a **Firebase**, un servizio gratuito di Google che ci dà
tre cose:

1. **Un login** (email/password e Google) → solo le persone autorizzate entrano.
2. **Un database online** (si chiama *Firestore*) → i dati sono salvati nel cloud, al sicuro, e
   raggiungibili da qualsiasi dispositivo.
3. **Delle regole di sicurezza** → decidono *chi può leggere/scrivere cosa*. Questa è la parte più
   importante: senza, i dati sarebbero accessibili a chiunque.

> 💡 **Concetto chiave:** la sicurezza vera **non** sta nell'app (il codice che gira nel browser si può
> aggirare). Sta nelle **regole** che impostiamo su Firebase. Per questo i passi 5 e 6 sono obbligatori
> prima di inserire dati veri.

---

## Mini-glossario (tienilo a portata)

| Termine | In parole semplici |
|---|---|
| **Firebase** | Il "pannello di controllo" di Google dove vivono login, database e regole. |
| **Authentication** | Il sistema di login (chi sei). |
| **Firestore** | Il database dove finiscono i dati (i candidati, i documenti, ecc.). |
| **Regole (rules)** | Il "buttafuori": decidono chi può entrare e cosa può toccare. |
| **Ruolo (claim)** | Un'etichetta sull'utente: `admin` o `operator`. La mette il server, non si può falsificare. |
| **Config** | Un pezzetto di testo che dice all'app *quale* progetto Firebase usare. |

---

## Passo 1 — Crea il progetto su Firebase

1. Vai su **https://console.firebase.google.com** e accedi con un account Google.
2. Clicca **"Crea un progetto"** (*Create a project*).
3. Dai un nome (es. `dominicahealthlink`), accetta e vai avanti. Su Google Analytics puoi scegliere
   **"Non ora"** — non serve.
4. Attendi qualche secondo: il progetto è pronto.

> 💡 Un "progetto" è semplicemente il contenitore di tutto: login + database + regole stanno qui dentro.

---

## Passo 2 — Attiva il login (Authentication)

1. Nel menu a sinistra, apri **Build → Authentication**.
2. Clicca **"Inizia"** (*Get started*).
3. Nella scheda **"Sign-in method"** attiva i metodi che vuoi:
   - **Email/Password** → clicca, metti l'interruttore su *Attiva* (*Enable*) e salva.
   - **Google** → clicca, *Attiva*, scegli un'email di supporto e salva.

> 💡 Da qui in poi, ogni operatore avrà un proprio account. È quello che permette di sapere "chi sta
> usando l'app" e di tenere i dati protetti.

---

## Passo 3 — Crea il database (Firestore)

1. Menu a sinistra → **Build → Firestore Database**.
2. Clicca **"Crea database"** (*Create database*).
3. **IMPORTANTE:** scegli **"Inizia in modalità produzione"** (*Start in production mode*), **non**
   modalità test.
4. Scegli una *region* vicina (per l'Europa va bene `eur3`) e conferma.

> 💡 **Perché "produzione" e non "test"?** La modalità test apre il database a **tutti** per 30 giorni:
> chiunque potrebbe leggere o cancellare i tuoi dati. La modalità produzione parte **chiusa**, e poi
> saremo noi a decidere chi può fare cosa (Passo 5).

---

## Passo 4 — Collega l'app a Firebase (la "config")

1. In alto a sinistra clicca l'ingranaggio ⚙️ → **"Impostazioni progetto"** (*Project settings*).
2. Scorri fino a **"Le tue app"** e clicca l'icona **web** `</>`.
3. Dai un nickname (es. `web`) e registra l'app (non serve "Firebase Hosting" per ora).
4. Firebase ti mostra un blocco `const firebaseConfig = { ... }`. **Copialo.**
5. Apri il file **`index.html`** con un editor di testo, cerca `const FIREBASE_CONFIG = {` (in alto) e
   **incolla i tuoi valori** al posto di quelli presenti:

```js
const FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "tuo-progetto.firebaseapp.com",
  projectId: "tuo-progetto",
  storageBucket: "tuo-progetto.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:abcdef",
};
```

6. Salva il file. Riapri l'app: ora invece della dashboard vedrai la **schermata di login**. 🎉

> 💡 **L'`apiKey` non è una password segreta.** Serve solo a dire "quale progetto Firebase". Va bene che
> sia dentro `index.html`. La protezione vera arriva al Passo 5.
>
> 💡 Apri sempre l'app tramite un mini-server locale (vedi in fondo), **non** facendo doppio clic sul
> file: il login con Google funziona solo via `http://localhost`, non con `file://`.

---

## Passo 5 — Metti in sicurezza il database (le REGOLE) 🔒 — il passo più importante

Questo dice a Firebase: *"ogni utente può leggere e scrivere solo i propri dati, nessun altro, e nessuno
può entrare senza login"*. Il file con le regole è già pronto nella cartella: **`firestore.rules`**.

Hai due modi per applicarlo. **Il più semplice (copia-incolla):**

1. Apri il file `firestore.rules` con un editor di testo e **copia tutto il contenuto**.
2. Nella console Firebase: **Firestore Database → scheda "Regole" (*Rules*)**.
3. **Cancella** quello che c'è e **incolla** il contenuto copiato.
4. Clicca **"Pubblica"** (*Publish*).

✅ **Verifica che funzioni** (facoltativo ma consigliato): sempre nella scheda Regole c'è
**"Playground delle regole"**. Prova una lettura del percorso `nurseflow/qualcosa` **senza autenticazione**:
deve risultare **negata** (*Denied*). È il segno che il database è chiuso a chi non ha fatto login. 👍

> 💡 **Cosa fanno queste regole, in breve:** ogni persona ha un suo "cassetto" (`nurseflow/IL-SUO-ID`) e
> può aprire **solo il proprio**. Tutto il resto è vietato per default.

---

## Passo 6 — Crea il primo Amministratore (i "ruoli")

Nell'app esistono due livelli:
- **Amministratore** → può gestire le anagrafiche di base (Impostazioni) e tutto il resto.
- **Operatore** → lavora sulle pratiche, ma non tocca le anagrafiche di base.

Per ragioni di sicurezza, il ruolo **non** si imposta dall'app (sarebbe falsificabile): si imposta dal
**server**, con un piccolo comando. Si fa **una volta sola** per assegnare il primo admin.

### 6.1 — Installa Node.js (se non ce l'hai già)
Node.js è il programma che ci permette di lanciare il comando. Scaricalo da **https://nodejs.org**
(versione "LTS"), installalo con doppio clic e avanti-avanti. Per verificare, apri il **Terminale** e scrivi:
```bash
node -v
```
Se compare un numero di versione, è installato. ✅

### 6.2 — Scarica la "chiave di servizio"
È un file che autorizza il comando a parlare col tuo Firebase **da amministratore**.
1. Console Firebase → ⚙️ **Impostazioni progetto → scheda "Account di servizio"** (*Service accounts*).
2. Clicca **"Genera nuova chiave privata"** (*Generate new private key*) → si scarica un file `.json`.
3. Sposta quel file dentro la cartella **`scripts/`** del progetto e **rinominalo** esattamente:
   `serviceAccountKey.json`.

> ⚠️ **Questo file è una password potentissima.** Non inviarlo a nessuno, non caricarlo online.
> Nel progetto c'è già un `.gitignore` che impedisce di pubblicarlo per sbaglio.

### 6.3 — Lancia il comando
Apri il Terminale, entra nella cartella `scripts` e installa gli strumenti (solo la prima volta):
```bash
cd /Users/itavix/Desktop/claude_code/DominicaHealthLink/scripts
npm install
```
Poi assegna il ruolo admin alla **tua** email (la stessa con cui fai login nell'app):
```bash
node set-admin-claim.js tua@email.com admin
```
Per dare a un collega il ruolo operatore:
```bash
node set-admin-claim.js collega@email.com operator
```

### 6.4 — Applica il ruolo
Chi ha ricevuto un ruolo deve **uscire e rientrare** (logout + login) nell'app: solo così il nuovo ruolo
diventa attivo. Da quel momento l'admin vede la scheda **Impostazioni**, l'operatore no.

> 💡 **Senza ruolo assegnato:** un utente che fa login resta "amministratore del proprio spazio
> personale" — è sicuro, perché i dati sono comunque separati per persona (Passo 5). I ruoli contano
> davvero quando attivi il **workspace condiviso** (Passo 7).

---

## Passo 7 — (Opzionale) Workspace condiviso del team

Per impostazione predefinita **ogni operatore ha i propri candidati**, separati dagli altri. Se invece
vuoi che **tutto il team veda gli stessi candidati** (e solo gli admin modifichino le anagrafiche di base),
attiva il workspace condiviso.

1. **Prima** completa i Passi 5 e 6 (regole pubblicate + almeno un admin creato). È necessario.
2. In `index.html`, in alto, cambia:
   ```js
   const SHARED_WORKSPACE = true;   // era false
   ```
3. Salva e riapri l'app.

Da questo momento:
- I **candidati** sono condivisi: ogni operatore può lavorarci.
- Le **anagrafiche di base** (agenzie, datori di lavoro, operatori, tipi di documento) le modificano
  **solo gli admin**.
- Chi entra senza un ruolo assegnato è trattato come **operatore** (privilegio minimo).

> 💡 **Nota pratica:** in questa modalità i salvataggi avvengono "a blocchi": se due persone modificano
> *nello stesso istante*, l'ultimo che salva vince. Per un team piccolo va benissimo. Se sarete in
> *tanti* a scrivere contemporaneamente, chiedi la variante "un documento per pratica" (più robusta).

---

## Passo 7-bis — Caricamento dei file dei documenti (Firebase Storage)

Nella sezione "Ciclo di Vita dei Documenti", il pulsante **Carica** apre il selettore di file del
computer e allega il documento (PDF, foto, scansione). Per salvarli **nel cloud** (consigliato con dati
veri) attiva **Storage**:

1. Console Firebase → **Build → Storage** → **"Inizia"** → conferma (modalità produzione).
2. Pubblica le regole dei file: incolla il contenuto di `storage.rules` in **Storage → Regole** →
   **Pubblica** (oppure da terminale: `firebase deploy --only storage`).

> 💡 **Senza Storage** l'app funziona lo stesso: i file piccoli vengono salvati localmente per
> l'anteprima. Per documenti grandi e condivisi tra dispositivi serve Storage attivo.
> Le regole fanno sì che ogni utente veda solo i propri file (o, in modalità team, solo gli operatori).

---

## Passo 8 — Ultimi accorgimenti di sicurezza

- **Domini autorizzati:** Authentication → *Settings* → *Authorized domains*. Lascia solo `localhost`
  (per i test) e il dominio reale da cui userai l'app. Serve per il login Google.
- **App Check** (consigliato): Firestore → *App Check*. Blocca richieste che non arrivano dalla tua vera
  app, riducendo abusi.
- **HTTPS:** quando pubblichi l'app online, usala sempre in `https://` (non `file://`).

### ✅ Checklist finale prima dei dati veri
- [ ] Firestore in **modalità produzione**.
- [ ] Regole di `firestore.rules` **pubblicate** e testate nel Playground.
- [ ] Solo i metodi di login che usi sono attivi.
- [ ] Primo **admin** creato con il comando; operatori assegnati.
- [ ] Il file `serviceAccountKey.json` **non** è stato condiviso/pubblicato.
- [ ] (Se team condiviso) `SHARED_WORKSPACE = true` solo dopo i punti sopra.

---

## Come avviare l'app in locale
Apri il Terminale nella cartella del progetto e lancia un mini-server:
```bash
cd /Users/itavix/Desktop/claude_code/DominicaHealthLink
python3 -m http.server
```
Poi apri nel browser **http://localhost:8000** . (Non aprire `index.html` con doppio clic: il login
Google non funziona da `file://`.)

---

## Problemi comuni (e soluzioni)

**"Vedo ancora la dashboard, non il login."**
→ La `FIREBASE_CONFIG` non è ancora compilata, oppure non hai salvato `index.html`. Ricontrolla il Passo 4.

**"Missing or insufficient permissions" / errore quando salvo.**
→ Le regole non sono pubblicate o sei in un'area non consentita. Rivedi il Passo 5. In modalità condivisa,
ricordati che le **Impostazioni** le salva solo un admin.

**"Il login Google si apre e si chiude subito."**
→ Stai aprendo l'app con `file://`. Usa `http://localhost` (vedi sopra) e aggiungi il dominio in
*Authorized domains* (Passo 8).

**"Ho assegnato il ruolo ma non cambia nulla."**
→ La persona deve fare **logout e login** per aggiornare il ruolo.

**"`node` non è riconosciuto."**
→ Node.js non è installato o il Terminale va riavviato dopo l'installazione (Passo 6.1).

---

Se un passaggio non ti torna, scrivimi *a che punto sei bloccato* e il messaggio esatto che vedi:
ti guido da lì. 🙂
