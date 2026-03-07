import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { FiShoppingBag, FiPlus, FiX, FiTag } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './Marketplace.css'

const CATEGORIES = ['Elettronica','Abbigliamento','Casa','Sport','Auto','Musica','Libri','Altro']
const CONDITIONS  = ['nuovo','come nuovo','usato','da riparare']

export function MarketplacePage() {
  const { user, isAuthenticated } = useAuth()
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter]   = useState('')
  const [form, setForm]       = useState({ title:'',description:'',price:'',category:'Altro',condition:'nuovo' })
  const [saving, setSaving]   = useState(false)

  useEffect(() => { fetchItems() }, [filter])

  const fetchItems = async () => {
    setLoading(true)
    let q = supabase.from('marketplace_items')
      .select('*, profiles(id,username,full_name,avatar_url)')
      .eq('sold', false).order('created_at',{ascending:false})
    if (filter) q = q.eq('category', filter)
    const { data } = await q
    setItems(data||[]); setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Titolo richiesto'); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('marketplace_items').insert({ ...form, price:parseFloat(form.price)||0, user_id:user.id })
      if (error) throw error
      toast.success('Annuncio pubblicato!')
      setShowForm(false); setForm({ title:'',description:'',price:'',category:'Altro',condition:'nuovo' })
      fetchItems()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="market-page animate-fadeIn">
      <div className="market-header">
        <h1><FiShoppingBag size={22}/> Marketplace</h1>
        <div className="market-header-actions">
          <div className="market-cats">
            <button className={`market-cat ${!filter?'active':''}`} onClick={() => setFilter('')}>Tutti</button>
            {CATEGORIES.map(c => <button key={c} className={`market-cat ${filter===c?'active':''}`} onClick={() => setFilter(c)}>{c}</button>)}
          </div>
          {isAuthenticated && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(p=>!p)}>
              {showForm ? <><FiX size={14}/> Annulla</> : <><FiPlus size={14}/> Vendi</>}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="card market-form animate-slideUp">
          <h3>Nuovo annuncio</h3>
          <form onSubmit={handleSubmit}>
            <div className="market-form-grid">
              {[
                { label:'Titolo *', key:'title', ph:'Cosa vendi?' },
                { label:'Prezzo (€)', key:'price', ph:'0.00', type:'number' },
              ].map(f => (
                <div key={f.key} className="input-wrap">
                  <label className="input-label">{f.label}</label>
                  <input className="input" type={f.type||'text'} placeholder={f.ph} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}/>
                </div>
              ))}
              <div className="input-wrap full">
                <label className="input-label">Descrizione</label>
                <textarea className="input" rows={3} placeholder="Descrivi il prodotto…" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}/>
              </div>
              <div className="input-wrap">
                <label className="input-label">Categoria</label>
                <select className="input" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-wrap">
                <label className="input-label">Condizioni</label>
                <select className="input" value={form.condition} onChange={e=>setForm(p=>({...p,condition:e.target.value}))}>
                  {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{marginTop:'1rem',display:'flex',justifyContent:'flex-end'}}>
              <button type="submit" className="btn btn-primary btn-md" disabled={saving}>
                {saving ? <><span className="spinner spinner-sm btn-spin"/>Pubblicazione…</> : 'Pubblica annuncio'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="page-loader"><div className="spinner"/></div> : (
        <div className="market-grid">
          {items.map(item => {
            const pf = item.profiles
            return (
              <div key={item.id} className="market-item card">
                <div className="market-item-img">
                  {item.image_url ? <img src={item.image_url} alt=""/> : <div className="market-item-placeholder"><FiTag size={28}/></div>}
                  <span className="market-item-condition">{item.condition}</span>
                </div>
                <div className="market-item-body">
                  <h3 className="market-item-title">{item.title}</h3>
                  <p className="market-item-desc">{item.description}</p>
                  <div className="market-item-footer">
                    <span className="market-item-price">€{parseFloat(item.price||0).toFixed(2)}</span>
                    <span className="market-item-cat">{item.category}</span>
                  </div>
                  <div className="market-item-seller">
                    <div className="avatar avatar-xs">{pf?.avatar_url?<img src={pf.avatar_url} alt=""/>:(pf?.full_name||pf?.username||'U').slice(0,2).toUpperCase()}</div>
                    <span>{pf?.full_name||pf?.username}</span>
                  </div>
                </div>
              </div>
            )
          })}
          {items.length===0 && <div className="market-empty"><FiShoppingBag size={40}/><p>Nessun annuncio.</p></div>}
        </div>
      )}
    </div>
  )
}
