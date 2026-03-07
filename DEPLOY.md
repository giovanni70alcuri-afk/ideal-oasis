# 🚀 OASIS NO LIMITS v2 — Guida Completa al Deploy
## Da zero a online in ~20 minuti

---

## PARTE 1 — SUPABASE (Backend gratuito)

### 1.1 Crea il progetto
1. Vai su **https://supabase.com** → Accedi / Registrati (gratis)
2. Clicca **"New project"**
3. Scegli nome: `oasis-no-limits`
4. Scegli una password sicura per il database → salvala
5. Seleziona la regione più vicina (es. **Frankfurt** per Italia)
6. Clicca **"Create new project"** → attendi 2 minuti

### 1.2 Crea le tabelle (schema)
1. Nel menu a sinistra: **SQL Editor**
2. Clicca **"New query"**
3. Copia tutto il contenuto del file `supabase/schema.sql`
4. Incollalo nell'editor e clicca **"Run"** ▶️
5. Dovresti vedere: *"Success. No rows returned"*

### 1.3 Crea i bucket Storage
1. Menu a sinistra: **Storage**
2. Clicca **"New bucket"** e crea questi 4:

| Nome | Public |
|------|--------|
| `post-images` | ✅ Sì |
| `avatars` | ✅ Sì |
| `covers` | ✅ Sì |
| `marketplace` | ✅ Sì |

### 1.4 Copia le chiavi API
1. Menu a sinistra: **Settings** → **API**
2. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public** key → `VITE_SUPABASE_ANON_KEY`

---

## PARTE 2 — SETUP LOCALE

### 2.1 Prerequisiti
- Node.js 18+ installato → verifica con `node -v`
- Git installato → verifica con `git --version`

### 2.2 Installa le dipendenze
```bash
cd oasis-no-limits
npm install
```

### 2.3 Configura le variabili d'ambiente
```bash
cp .env.example .env.local
```
Apri `.env.local` e inserisci le tue chiavi:
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### 2.4 Avvia in locale
```bash
npm run dev
```
Apri **http://localhost:3000** 🎉

---

## PARTE 3 — DEPLOY SU VERCEL (Gratis)

### 3.1 Pubblica su GitHub
```bash
git init
git add .
git commit -m "🚀 OASIS NO LIMITS v2"
# Crea repo su github.com poi:
git remote add origin https://github.com/TUO_USERNAME/oasis-no-limits.git
git branch -M main
git push -u origin main
```

### 3.2 Deploy su Vercel
1. Vai su **https://vercel.com** → Accedi con GitHub
2. Clicca **"Add New… → Project"**
3. Seleziona il repository `oasis-no-limits`
4. In **"Environment Variables"** aggiungi:
   - `VITE_SUPABASE_URL` = il tuo URL
   - `VITE_SUPABASE_ANON_KEY` = la tua chiave
5. Clicca **"Deploy"** 🚀

Vercel ti darà un URL tipo: `https://oasis-no-limits.vercel.app`

### 3.3 Dominio personalizzato (opzionale)
1. In Vercel: **Settings → Domains**
2. Aggiungi il tuo dominio (es. `oasisnolimits.it`)
3. Segui le istruzioni DNS del tuo provider

---

## PARTE 4 — CHECKLIST FINALE

### ✅ Test funzionalità
- [ ] Homepage si carica
- [ ] Registrazione funziona
- [ ] Login / Logout funzionano
- [ ] Feed carica i post
- [ ] Crea post (testo)
- [ ] Crea post (con immagine)
- [ ] Like ai post
- [ ] Commenti
- [ ] Profilo visibile
- [ ] Modifica profilo
- [ ] Segui / Smetti di seguire
- [ ] Notifiche
- [ ] Ricerca utenti
- [ ] Marketplace
- [ ] Raccolte
- [ ] Reels
- [ ] Locale
- [ ] Refresh pagina mantiene sessione
- [ ] Route protette redirigono al login

### ✅ Sicurezza Supabase
- [ ] RLS attivo su tutte le tabelle (già nel schema)
- [ ] Chiavi API mai comittate su Git (`.env.local` è in `.gitignore`)

---

## STRUTTURA PROGETTO

```
oasis-no-limits/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Feed/          ← Feed con infinite scroll
│   │   ├── Layout/        ← Layout con sidebar
│   │   ├── Navbar/        ← Barra navigazione
│   │   ├── PostCard/      ← Card singolo post
│   │   ├── Sidebar/       ← Sidebar sx + dx con slot ads
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx  ← Gestione auth completa
│   ├── lib/
│   │   └── supabase.js      ← Client Supabase
│   ├── pages/
│   │   ├── Home/            ← Feed principale
│   │   ├── Auth/            ← Login + Signup
│   │   ├── Profile/         ← Profilo + modifica
│   │   ├── Post/            ← Dettaglio post + commenti
│   │   ├── CreatePost/      ← Crea post/reel
│   │   ├── Notifications/   ← Notifiche realtime
│   │   ├── Friends/         ← Amici / follow
│   │   ├── Reels/           ← Pagina video
│   │   ├── Marketplace/     ← Compra/vendi
│   │   ├── Collections/     ← Post salvati
│   │   └── Local/           ← Contenuti per zona
│   ├── styles/
│   │   └── index.css        ← Design system globale
│   ├── App.jsx              ← Router principale
│   └── main.jsx             ← Entry point
├── supabase/
│   └── schema.sql           ← Schema DB completo
├── .env.example
├── .env.local               ← ⚠️ NON committare!
├── vercel.json
├── vite.config.js
└── package.json
```

---

## AGGIORNAMENTI FUTURI

Per aggiornare il sito dopo modifiche:
```bash
git add .
git commit -m "descrizione modifiche"
git push
```
Vercel fa il deploy automatico in ~1 minuto.

---

**OASIS NO LIMITS v2.0 — Built with React + Supabase + Vercel**
