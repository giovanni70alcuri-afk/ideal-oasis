import PocketBase from 'pocketbase'

const pocketbaseUrl = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090'

export const pb = new PocketBase(pocketbaseUrl)

export const VITE_POCKETBASE_URL = pocketbaseUrl

// Helper per gestire le immagini
export const getImageUrl = (collectionId, recordId, fileName) => {
  if (!fileName) return null
  return `${pocketbaseUrl}/api/files/${collectionId}/${recordId}/${fileName}`
}

// Funzione per verificare se l'utente e' loggato
export const isAuthenticated = () => {
  return pb.authStore.isValid
}

// Funzione per ottenere l'utente corrente
export const getCurrentUser = () => {
  return pb.authStore.model
}

export default pb
