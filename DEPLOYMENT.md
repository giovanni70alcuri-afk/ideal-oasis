# ===========================================
# OASIS NO LIMITS - Guida Deployment con PocketBase
# ===========================================

Questa guida spiega come mettere online il social network OASIS NO LIMITS
utilizzando PocketBase come backend completo (database + auth + storage).

## PREREQUISITI

- Account GitHub (https://github.com)
- Account per hosting (Fly.io, Railway, Render, o VPS)
- Node.js 18+ installato localmente

---

## PARTE 1: POCKETBASE SETUP LOCALE

### 1.1 Scarica PocketBase

```bash
# Scarica l'ultima versione
wget https://github.com/pocketbase/pocketbase/releases/latest/download/pocketbase_xxx_linux_amd64.zip

# Estrai
unzip pocketbase_xxx_linux_amd64.zip

# Rendi eseguibile
chmod +x pocketbase
```

### 1.2 Avvia PocketBase

```bash
./pocketbase serve
```

PocketBase sara' disponibile su http://127.0.0.1:8090

### 1.3 Crea Admin Account

1. Vai su http://127.0.0.1:8090/_
2. Crea un account admin

### 1.4 Configura Collections

Crea le seguenti collections in PocketBase Admin UI:

**1. profiles**
- Campo: `id` (relation to users, single)
- Campo: `username` (text)
- Campo: `name` (text)
- Campo: `avatar` (file, max 1MB)
- Campo: `bio` (text)
- Campo: `location` (text)
- API Rules:
  - List/View: `@request.auth.id != ""` (solo utenti loggati)
  - Create: `@request.auth.id != ""` (auto-create trigger)
  - Update/Delete: `@request.auth.id = id`

**2. posts**
- Campo: `user_id` (relation to users, single)
- Campo: `content` (text)
- Campo: `image` (file, max 5MB)
- API Rules:
  - List/View: pubblico
  - Create: `@request.auth.id != ""`
  - Update/Delete: `@request.auth.id = user_id`

**3. likes**
- Campo: `user_id` (relation to users, single)
- Campo: `post_id` (relation to posts, single)
- API Rules:
  - List/View: pubblico
  - Create/Update/Delete: `@request.auth.id != ""`

**4. comments**
- Campo: `post_id` (relation to posts, single)
- Campo: `user_id` (relation to users, single)
- Campo: `content` (text)
- API Rules:
  - List/View: pubblico
  - Create: `@request.auth.id != ""`
  - Update/Delete: `@request.auth.id = user_id`

**5. follows**
- Campo: `follower_id` (relation to users, single)
- Campo: `following_id` (relation to users, single)
- API Rules:
  - List/View: pubblico
  - Create: `@request.auth.id != ""`
  - Delete: `@request.auth.id = follower_id`

**6. notifications**
- Campo: `user_id` (relation to users, single)
- Campo: `from_user_id` (relation to users, single)
- Campo: `type` (select: like, follow, comment)
- Campo: `post_id` (relation to posts, single)
- Campo: `message` (text)
- Campo: `read` (bool, default false)
- API Rules:
  - List/View: `@request.auth.id = user_id`
  - Create: sistema (via API)
  - Update/Delete: `@request.auth.id = user_id`

---

## PARTE 2: GITHUB SETUP

### 2.1 Crea repository

1. Vai su https://github.com e accedi
2. Clicca "+" > "New repository"
3. Nome: `oasis-no-limits`
4. Description: `Social network - OASIS NO LIMITS with PocketBase`
5. Clicca "Create repository"

### 2.2 Carica il codice

```bash
cd /workspace

git init
git add .
git commit -m "Initial commit: OASIS NO LIMITS with PocketBase"

git remote add origin https://github.com/TUO_USERNAME/oasis-no-limits.git
git branch -M main
git push -u origin main
```

---

## PARTE 3: DEPLOYMENT

### Opzione A: Fly.io (Consigliato per PocketBase)

```bash
# Installa flyctl
curl -L https://fly.io/install.sh | sh

# Accedi
flyctl auth login

# Crea app
flyctl apps create oasis-no-limits

# Launch con Dockerfile
flyctl launch

# Aggiungi volume per PocketBase data
flyctl volumes create pocketbase_data --size 1

# Configura secrets
flyctl secrets set PB_ADMIN_EMAIL=admin@example.com
flyctl secrets set PB_ADMIN_PASSWORD=your_secure_password
```

Crea un `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/assets/index.js"]
```

### Opzione B: Vercel (Solo Frontend)

1. Vai su https://vercel.com e accedi
2. Clicca "Add New..." > "Project"
3. Seleziona il repository
4. In Environment Variables aggiungi:
   - `VITE_POCKETBASE_URL`: URL del tuo PocketBase (es. https://oasis.pocketbase.io)
5. Clicca "Deploy"

### Opzione C: Railway

1. Vai su https://railway.com e accedi
2. Clicca "New Project"
3. Seleziona "Deploy from GitHub repo"
4. Configura environment variables

---

## PARTE 4: CONFIGURAZIONE FINALE

### 4.1 Aggiorna .env

```bash
cp .env.example .env
# Modifica VITE_POCKETBASE_URL con l'URL del tuo PocketBase
```

### 4.2 Test locale

```bash
# Terminale 1: PocketBase
./pocketbase serve

# Terminale 2: App
npm run dev
```

Vai su http://localhost:3000

### 4.3 Checklist post-deploy

- [ ] La home page si carica
- [ ] Posso registrarmi / accedere
- [ ] Posso creare un post
- [ ] Posso mettere like
- [ ] Posso commentare
- [ ] Posso seguire altri utenti
- [ ] Le immagini si caricano correttamente
- [ ] Le notifiche funzionano

---

## STRUTTURA PROGETTO

```
oasis-no-limits/
├── src/
│   ├── components/
│   │   ├── ui/          # Button, Input, Card, Avatar, Loading
│   │   ├── Layout/      # Layout principale
│   │   ├── Navbar/      # Navigazione
│   │   ├── Feed/        # Feed posts
│   │   ├── PostCard/    # Card singolo post
│   │   └── ProtectedRoute/
│   ├── pages/
│   │   ├── Home/        # Home page con feed
│   │   ├── Auth/        # Login e Signup
│   │   ├── Profile/     # Profilo utente
│   │   ├── CreatePost/  # Crea nuovo post
│   │   ├── PostDetail/  # Dettaglio post + commenti
│   │   └── Notifications/
│   ├── context/
│   │   └── AuthContext.jsx  # Gestione autenticazione PocketBase
│   ├── lib/
│   │   └── pocketbase.js  # Client PocketBase
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── package.json
├── vite.config.js
└── vercel.json
```

---

## VANTAGGI POCKETBASE

- **100% gratuito** - Nessun limite di utilizzo
- **Tutto incluso** - Database, Auth, Storage, Realtime
- **Facile da usare** - Admin UI intuitiva
- **Open source** - Controllo totale sui dati
- **Leggero** - Solo ~30MB

---

**OASIS NO LIMITS v1.0.0 con PocketBase**
Social network senza limiti, completamente gratuito.
