# DominicaHealthLink

Gestionale trasferimento infermieri (Repubblica Dominicana → Italia). PWA con Firebase
(Authentication + Firestore + Storage), Tailwind CSS e icone Lucide.

## Struttura del progetto

```
DominicaHealthLink/
├── index.html                ← shell HTML: meta, splash screen di avvio, entry <script>
├── src/
│   ├── main.js               ← entry point (stili + app + registrazione service worker)
│   ├── app.js                ← tutta la logica applicativa (config Firebase inclusa)
│   ├── i18n-data.js          ← dizionari di traduzione it / en / es (solo dati)
│   └── styles.css            ← direttive Tailwind + CSS custom (dark mode, tour, safe-area)
├── public/                   ← asset statici copiati così come sono nella build
│   ├── sw.js                 ← service worker (cache offline + avvii istantanei)
│   ├── site.webmanifest      ← manifest PWA
│   └── *.svg / *.png         ← icone e favicon
├── dist/                     ← build di produzione (generata, non modificare a mano)
├── firestore.rules           ← regole di sicurezza Firestore
├── storage.rules             ← regole di sicurezza Storage
├── index.single-file.bak.html← backup della vecchia versione monolitica (pre-Vite)
└── scripts/                  ← utilità admin (set-admin-claim)
```

## Comandi

Richiede Node.js (≥ 18). Prima volta: `npm install`.

| Comando           | Cosa fa                                                        |
|-------------------|----------------------------------------------------------------|
| `npm run dev`     | Server di sviluppo con ricarica automatica (http://localhost:5173) |
| `npm run build`   | Build di produzione in `dist/`                                 |
| `npm run preview` | Serve la build di `dist/` in locale (http://localhost:4599)    |

**Da pubblicare online:** il contenuto della cartella `dist/` dopo `npm run build`
(es. Firebase Hosting con `public: "dist"`, Netlify, ecc.). Il service worker è attivo
solo nella build di produzione, mai in `npm run dev`.

## Dove si configura Firebase

`const FIREBASE_CONFIG = { ... }` è in cima a `src/app.js` (prima era dentro `index.html`;
la guida passo-passo in `GUIDA-SETUP.md` resta valida per tutto il resto).

## Note tecniche

- Le dipendenze sono **bloccate a versioni esatte** in `package.json` (niente `@latest`).
- Tailwind è **compilato** (niente Play CDN): le classi vengono raccolte scansionando
  `index.html` e `src/**/*.js`. Se costruisci classi dinamicamente per concatenazione di
  frammenti (es. `'bg-' + colore`), il compilatore non le vede: usa sempre stringhe complete
  nelle mappe (com'è già fatto in `STATUS_CLS`, `DOC_STATUS_CLS`, ecc.).
- Il service worker (`public/sw.js`) usa network-first per la pagina e cache-first per gli
  asset. Per forzare l'invalidazione totale della cache, incrementa `CACHE_VERSION`.
- All'avvio, se esiste una cache locale (`localStorage`), l'app la mostra subito e aggiorna
  da Firestore in background: l'apertura è istantanea anche con rete lenta.
