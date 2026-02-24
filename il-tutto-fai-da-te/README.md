# Il Tutto Fai Da Te - Sito di Angelo Cacioppo

Benvenuto nel sito web di **Angelo Cacioppo** dedicato al mondo del fai da te, dell'elettronica, del restauro e della musica hi-fi.

## 📁 Struttura del Progetto

```
il-tutto-fai-da-te/
├── index.html                    # Pagina principale
├── css/
│   └── style.css                # Stili del sito
├── js/
│   └── script.js                # Logica JavaScript
├── json/
│   ├── libri.json               # Catalogo libri
│   ├── sidebar.json             # Link sidebar destra
│   ├── contatti.json            # Informazioni contatti
│   ├── footer.json              # Footer
│   ├── video.json               # Video hi-fi
│   ├── restauro.json            # Progetti restauro
│   ├── elettronica.json         # Progetti elettronica
│   ├── recensioni_attrezzi.json # Recensioni attrezzi
│   ├── deposito_progetti.json   # Archivio progetti
│   └── faidate.json             # Video fai da te
└── README.md                     # Questo file
```

## 🚀 Come Usare il Sito

### Localmente
1. Scarica o clona il repository
2. Apri il file `index.html` nel browser
3. Il sito caricherà automaticamente tutti i dati dai file JSON

### Su GitHub Pages
1. Crea un repository su GitHub
2. Carica tutti i file del progetto
3. Vai su **Settings > Pages** e seleziona il branch `main`
4. Il sito sarà disponibile a `https://tuonome.github.io/il-tutto-fai-da-te`

## 📝 Come Modificare i Contenuti

### Aggiungere un Nuovo Libro
Modifica il file `json/libri.json`:
```json
{
  "titolo": "Titolo del Libro",
  "link": "https://www.amazon.it/dp/XXXXX",
  "immagine": "https://link-immagine.jpg"
}
```

### Aggiungere un Nuovo Progetto
Modifica il file corrispondente (es. `json/video.json`):
```json
{
  "titolo": "Titolo Progetto",
  "descrizione": "Descrizione del progetto",
  "link": "https://link-al-progetto",
  "data": "2024-01-23"
}
```

### Modificare i Contatti
Modifica il file `json/contatti.json`:
```json
{
  "email_destinatario": "tua-email@example.com",
  "telefono": "+39 XXX XXX XXXX",
  "social": {
    "youtube": "https://www.youtube.com/tuocanale",
    "instagram": "https://www.instagram.com/tuoprofilo",
    "facebook": "https://www.facebook.com/tuoprofilo"
  }
}
```

## 🎨 Personalizzazione Stile

Modifica il file `css/style.css` per cambiare:
- Colori (cerca `#003366` per il blu principale, `#cd2121` per il rosso)
- Font e dimensioni
- Layout e spacing
- Effetti hover

## 🤖 Chatbot

Il chatbot risponde automaticamente a domande comuni. Modifica le risposte nel file `js/script.js` nella sezione `botResponses`.

## 📱 Responsive Design

Il sito è completamente responsive e si adatta a:
- Desktop (1400px+)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## ⚙️ Tecnologie Utilizzate

- **HTML5** - Struttura
- **CSS3** - Stile e layout
- **JavaScript Vanilla** - Interattività
- **JSON** - Gestione dati
- **Font Awesome** - Icone

## 🔧 Requisiti

- Browser moderno (Chrome, Firefox, Safari, Edge)
- Nessun server backend necessario
- Nessun database necessario

## 📄 Licenza

Tutti i contenuti sono © 2024 Angelo Cacioppo - Tutti i diritti riservati.

## 💡 Suggerimenti

- Mantieni i nomi dei file JSON uguali ai nomi delle categorie nel menu
- Assicurati che i percorsi dei file siano corretti
- Usa immagini di buona qualità per i libri e i progetti
- Testa il sito su diversi browser prima di pubblicare

## 🆘 Supporto

Per domande o problemi, contatta Angelo Cacioppo tramite:
- Email: (vedi contatti.json)
- Social media: (vedi contatti.json)

---

**Buon lavoro con il tuo sito!** 🎉
