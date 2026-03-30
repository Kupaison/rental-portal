import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'kupa2024admin'

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [view, setView] = useState('listings') // listings | add | submissions
  const [listings, setListings] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)

  useEffect(() => {
    if (authed) { loadListings(); loadSubmissions() }
  }, [authed])

  async function loadListings() {
    const { data } = await supabase.from('listings').select('*, listing_photos(id, public_url, label, sort_order)').order('created_at', { ascending: false })
    if (data) setListings(data.map(l => ({ ...l, listing_photos: (l.listing_photos || []).sort((a,b) => a.sort_order - b.sort_order) })))
    setLoading(false)
  }

  async function loadSubmissions() {
    const { data } = await supabase.from('interest_submissions').select('*').order('created_at', { ascending: false })
    if (data) setSubmissions(data)
  }

  async function toggleActive(id, current) {
    await supabase.from('listings').update({ active: !current }).eq('id', id)
    setListings(ls => ls.map(l => l.id === id ? { ...l, active: !current } : l))
  }

  async function toggleFeatured(id, current) {
    await supabase.from('listings').update({ featured: !current }).eq('id', id)
    setListings(ls => ls.map(l => l.id === id ? { ...l, featured: !current } : l))
  }

  async function deleteListing(id) {
    if (!confirm('Delete this listing and all its photos? This cannot be undone.')) return
    await supabase.from('listing_photos').delete().eq('listing_id', id)
    await supabase.from('listings').delete().eq('id', id)
    setListings(ls => ls.filter(l => l.id !== id))
  }

  async function markContacted(id) {
    await supabase.from('interest_submissions').update({ contacted: true }).eq('id', id)
    setSubmissions(ss => ss.map(s => s.id === id ? { ...s, contacted: true } : s))
  }

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: 'var(--deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '48px 40px', maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>Admin Access</div>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '28px' }}>Rental Portal Dashboard</p>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (pw === ADMIN_PASSWORD ? setAuthed(true) : alert('Wrong password'))}
          placeholder="Enter admin password"
          style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none', marginBottom: '14px', fontFamily: 'var(--font-body)' }}
        />
        <button
          onClick={() => pw === ADMIN_PASSWORD ? setAuthed(true) : alert('Wrong password')}
          style={{ width: '100%', padding: '12px', background: 'var(--charcoal)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
        >
          Enter Dashboard →
        </button>
      </div>
    </div>
  )

  const newSubmissions = submissions.filter(s => !s.contacted).length

  return (
    <div style={{ minHeight: '100vh', background: '#F5F4F2', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '240px', background: 'var(--deep)', padding: '28px 0', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <div style={{ padding: '0 24px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '600', color: 'white' }}>Admin</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>Rental Portal</div>
        </div>
        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { key: 'listings', label: 'Listings', count: listings.length },
            { key: 'add', label: '+ Add Listing', count: null },
            { key: 'submissions', label: 'Interest Requests', count: newSubmissions || null },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => { setView(item.key); setEditId(null) }}
              style={{
                background: view === item.key ? 'rgba(255,255,255,0.12)' : 'transparent',
                border: 'none', borderRadius: '8px', padding: '10px 14px', textAlign: 'left',
                color: view === item.key ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: '14px', fontWeight: view === item.key ? '500' : '400',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.15s', fontFamily: 'var(--font-body)'
              }}
            >
              {item.label}
              {item.count !== null && (
                <span style={{ background: item.key === 'submissions' ? 'var(--accent)' : 'rgba(255,255,255,0.15)', borderRadius: '100px', padding: '1px 8px', fontSize: '11px' }}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <a href="/" target="_blank" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            View Client Site ↗
          </a>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: '240px', flex: 1, padding: '40px', minHeight: '100vh' }}>
        {view === 'listings' && (
          <ListingsView listings={listings} loading={loading} onToggleActive={toggleActive} onToggleFeatured={toggleFeatured} onDelete={deleteListing} onEdit={id => { setEditId(id); setView('add') }} />
        )}
        {view === 'add' && (
          <AddListingView editId={editId} onSaved={() => { loadListings(); setView('listings'); setEditId(null) }} />
        )}
        {view === 'submissions' && (
          <SubmissionsView submissions={submissions} onContacted={markContacted} />
        )}
      </div>
    </div>
  )
}

// ---- Listings View ----
function ListingsView({ listings, loading, onToggleActive, onToggleFeatured, onDelete, onEdit }) {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '400', marginBottom: '28px' }}>All Listings</h1>
      {loading ? <p style={{ color: 'var(--muted)' }}>Loading...</p> : listings.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No listings yet. Click "+ Add Listing" to get started.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {listings.map(l => (
            <div key={l.id} style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: l.active ? '1px solid var(--border)' : '1px solid #ffd0d0' }}>
              {/* Thumb */}
              <div style={{ width: '72px', height: '54px', borderRadius: '8px', overflow: 'hidden', background: 'var(--sand-light)', flexShrink: 0 }}>
                {l.listing_photos?.[0] ? (
                  <img src={l.listing_photos[0].public_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🏠</div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '15px' }}>{l.address}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{l.city}, {l.state} {l.zip} · ${l.price.toLocaleString()}/mo · {l.bedrooms}bd {l.bathrooms}ba · {l.listing_photos?.length || 0} photos</div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Toggle label="Active" value={l.active} onChange={() => onToggleActive(l.id, l.active)} />
                <Toggle label="Featured" value={l.featured} onChange={() => onToggleFeatured(l.id, l.featured)} />
                <ActionBtn onClick={() => onEdit(l.id)}>Edit</ActionBtn>
                <ActionBtn onClick={() => onDelete(l.id)} danger>Delete</ActionBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---- Add / Edit Listing View ----
function AddListingView({ editId, onSaved }) {
  const [form, setForm] = useState({ address: '', city: '', state: 'FL', zip: '', price: '', bedrooms: '', bathrooms: '', sqft: '', description: '', amenities: '', available_date: '', pets_allowed: false, parking: '', laundry: '', active: true, featured: false })
  const [photos, setPhotos] = useState([])
  const [existingPhotos, setExistingPhotos] = useState([])
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    if (editId) loadExisting()
  }, [editId])

  async function loadExisting() {
    const { data } = await supabase.from('listings').select('*, listing_photos(*)').eq('id', editId).single()
    if (data) {
      setForm({
        address: data.address, city: data.city, state: data.state, zip: data.zip,
        price: data.price, bedrooms: data.bedrooms, bathrooms: data.bathrooms,
        sqft: data.sqft || '', description: data.description || '',
        amenities: (data.amenities || []).join(', '),
        available_date: data.available_date || '', pets_allowed: data.pets_allowed,
        parking: data.parking || '', laundry: data.laundry || '',
        active: data.active, featured: data.featured
      })
      setExistingPhotos((data.listing_photos || []).sort((a, b) => a.sort_order - b.sort_order))
    }
  }

  async function handleSave() {
    if (!form.address || !form.price) return alert('Address and price are required')
    setSaving(true)
    try {
      const payload = {
        address: form.address, city: form.city, state: form.state, zip: form.zip,
        price: parseInt(form.price), bedrooms: parseFloat(form.bedrooms),
        bathrooms: parseFloat(form.bathrooms), sqft: form.sqft ? parseInt(form.sqft) : null,
        description: form.description || null,
        amenities: form.amenities ? form.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
        available_date: form.available_date || null,
        pets_allowed: form.pets_allowed, parking: form.parking || null,
        laundry: form.laundry || null, active: form.active, featured: form.featured
      }

      let listingId = editId
      if (editId) {
        await supabase.from('listings').update(payload).eq('id', editId)
      } else {
        const { data } = await supabase.from('listings').insert(payload).select().single()
        listingId = data.id
      }

      // Upload new photos
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i].file
        const path = `${listingId}/${Date.now()}-${file.name.replace(/\s/g,'_')}`
        const { error: upErr } = await supabase.storage.from('listing-photos').upload(path, file)
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('listing-photos').getPublicUrl(path)
          await supabase.from('listing_photos').insert({
            listing_id: listingId, storage_path: path,
            public_url: urlData.publicUrl, label: photos[i].label || null,
            sort_order: existingPhotos.length + i
          })
        }
      }

      onSaved()
    } catch (err) {
      alert('Error saving: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteExistingPhoto(photo) {
    await supabase.storage.from('listing-photos').remove([photo.storage_path])
    await supabase.from('listing_photos').delete().eq('id', photo.id)
    setExistingPhotos(ep => ep.filter(p => p.id !== photo.id))
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files)
    const newPhotos = files.map(f => ({ file: f, label: '', preview: URL.createObjectURL(f) }))
    setPhotos(p => [...p, ...newPhotos])
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '400', marginBottom: '28px' }}>
        {editId ? 'Edit Listing' : 'Add New Listing'}
      </h1>

      <Section title="Address">
        <Row><FormField label="Street Address *" value={form.address} onChange={v => set('address', v)} /></Row>
        <Row cols={3}>
          <FormField label="City *" value={form.city} onChange={v => set('city', v)} />
          <FormField label="State" value={form.state} onChange={v => set('state', v)} />
          <FormField label="ZIP *" value={form.zip} onChange={v => set('zip', v)} />
        </Row>
      </Section>

      <Section title="Pricing & Specs">
        <Row cols={2}>
          <FormField label="Monthly Rent ($) *" value={form.price} onChange={v => set('price', v)} type="number" placeholder="1800" />
          <FormField label="Sq Ft" value={form.sqft} onChange={v => set('sqft', v)} type="number" />
        </Row>
        <Row cols={3}>
          <FormField label="Bedrooms *" value={form.bedrooms} onChange={v => set('bedrooms', v)} type="number" placeholder="3" />
          <FormField label="Bathrooms *" value={form.bathrooms} onChange={v => set('bathrooms', v)} type="number" placeholder="2" />
          <FormField label="Available Date" value={form.available_date} onChange={v => set('available_date', v)} placeholder="June 1, 2025" />
        </Row>
      </Section>

      <Section title="Details">
        <Row cols={2}>
          <FormField label="Parking" value={form.parking} onChange={v => set('parking', v)} placeholder="Attached garage" />
          <FormField label="Laundry" value={form.laundry} onChange={v => set('laundry', v)} placeholder="In-unit W/D" />
        </Row>
        <Row>
          <FormField label="Amenities (comma separated)" value={form.amenities} onChange={v => set('amenities', v)} placeholder="Pool, AC, Dishwasher, Yard" />
        </Row>
        <Row>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
            <input type="checkbox" checked={form.pets_allowed} onChange={e => set('pets_allowed', e.target.checked)} style={{ width: '16px', height: '16px' }} />
            Pets Allowed
          </label>
        </Row>
        <Row>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Describe the home..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </Row>
      </Section>

      <Section title="Photos">
        {/* Existing photos */}
        {existingPhotos.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            {existingPhotos.map(photo => (
              <div key={photo.id} style={{ position: 'relative', width: '120px' }}>
                <img src={photo.public_url} alt="" style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'center', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.label || 'No label'}</div>
                <button onClick={() => deleteExistingPhoto(photo)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '50%', width: '22px', height: '22px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* New photos */}
        {photos.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            {photos.map((p, i) => (
              <div key={i} style={{ width: '120px' }}>
                <img src={p.preview} alt="" style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px' }} />
                <input
                  value={p.label}
                  onChange={e => setPhotos(ps => ps.map((ph, idx) => idx === i ? { ...ph, label: e.target.value } : ph))}
                  placeholder="Label (e.g. Kitchen)"
                  style={{ width: '100%', marginTop: '4px', padding: '4px 8px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', fontSize: '11px', fontFamily: 'var(--font-body)' }}
                />
              </div>
            ))}
          </div>
        )}

        <button onClick={() => fileRef.current.click()} style={{ padding: '10px 20px', border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius)', background: 'transparent', fontSize: '14px', color: 'var(--muted)', cursor: 'pointer', width: '100%' }}>
          + Upload Photos
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
      </Section>

      <Section title="Visibility">
        <Row cols={2}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
            <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} style={{ width: '16px', height: '16px' }} />
            Active (visible to clients)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} style={{ width: '16px', height: '16px' }} />
            Featured (shown first)
          </label>
        </Row>
      </Section>

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '14px 32px', background: saving ? 'var(--muted)' : 'var(--charcoal)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '15px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Saving...' : (editId ? 'Save Changes' : 'Publish Listing')}
        </button>
      </div>
    </div>
  )
}

// ---- Submissions View ----
function SubmissionsView({ submissions, onContacted }) {
  const pending = submissions.filter(s => !s.contacted)
  const done = submissions.filter(s => s.contacted)

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '400', marginBottom: '28px' }}>Interest Requests</h1>
      {submissions.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No requests yet. They'll appear here when clients express interest.</p>
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <h3 style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: '12px' }}>
                Needs Follow-up ({pending.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                {pending.map(s => <SubmissionCard key={s.id} s={s} onContacted={onContacted} />)}
              </div>
            </>
          )}
          {done.length > 0 && (
            <>
              <h3 style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '12px' }}>
                Contacted ({done.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.6 }}>
                {done.map(s => <SubmissionCard key={s.id} s={s} onContacted={onContacted} />)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function SubmissionCard({ s, onContacted }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: s.contacted ? '1px solid var(--border)' : '1px solid rgba(181,72,42,0.2)', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontWeight: '600', fontSize: '15px' }}>{s.client_name}</span>
          {!s.contacted && <span style={{ background: 'var(--accent)', color: 'white', borderRadius: '100px', padding: '1px 8px', fontSize: '11px' }}>New</span>}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px' }}>
          {s.listing_address} · {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', flexWrap: 'wrap' }}>
          {s.client_phone && <a href={`tel:${s.client_phone}`} style={{ color: 'var(--accent)' }}>📞 {s.client_phone}</a>}
          {s.client_email && <a href={`mailto:${s.client_email}`} style={{ color: 'var(--accent)' }}>✉️ {s.client_email}</a>}
        </div>
        {s.message && <p style={{ fontSize: '13px', color: 'var(--charcoal)', marginTop: '10px', background: 'var(--cream)', padding: '10px 14px', borderRadius: 'var(--radius)', lineHeight: 1.5 }}>"{s.message}"</p>}
      </div>
      {!s.contacted && (
        <button onClick={() => onContacted(s.id)} style={{ padding: '8px 16px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', flexShrink: 0 }}>
          ✓ Mark Contacted
        </button>
      )}
    </div>
  )
}

// ---- Helpers ----
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }
const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', fontSize: '14px', fontFamily: 'var(--font-body)', outline: 'none', color: 'var(--charcoal)' }

function FormField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={inputStyle}
        onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onBlur={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
      />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '18px' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>{children}</div>
    </div>
  )
}

function Row({ children, cols }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols ? `repeat(${cols}, 1fr)` : '1fr', gap: '14px' }}>
      {children}
    </div>
  )
}

function Toggle({ label, value, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: value ? 'var(--charcoal)' : 'var(--muted)', userSelect: 'none' }}>
      <div
        onClick={onChange}
        style={{ width: '32px', height: '18px', background: value ? 'var(--charcoal)' : '#D0CEC9', borderRadius: '100px', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
      >
        <div style={{ position: 'absolute', top: '2px', left: value ? '16px' : '2px', width: '14px', height: '14px', background: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
      {label}
    </label>
  )
}

function ActionBtn({ children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', border: `1px solid ${danger ? '#ffb3a7' : 'var(--border-strong)'}`,
        borderRadius: 'var(--radius)', background: 'transparent', fontSize: '12px',
        color: danger ? 'var(--accent)' : 'var(--charcoal)', cursor: 'pointer', fontFamily: 'var(--font-body)',
        transition: 'all 0.15s'
      }}
      onMouseEnter={e => { e.currentTarget.style.background = danger ? '#fff0ee' : 'var(--cream)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}
