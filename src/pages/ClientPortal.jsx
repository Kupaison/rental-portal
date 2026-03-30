import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ListingCard from '../components/ListingCard'
import InterestModal from '../components/InterestModal'
import MapView from '../components/MapView'

export default function ClientPortal() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState(null)
  const [filter, setFilter] = useState({ minBed: 0, maxPrice: 0, pets: false })
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState('grid') // grid | map
  const [mapSelected, setMapSelected] = useState(null)

  useEffect(() => { loadListings() }, [])

  async function loadListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('*, listing_photos(public_url, label, sort_order)')
      .eq('active', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
    if (!error && data) {
      setListings(data.map(l => ({ ...l, listing_photos: (l.listing_photos || []).sort((a, b) => a.sort_order - b.sort_order) })))
    }
    setLoading(false)
  }

  const filtered = listings.filter(l => {
    if (filter.minBed && l.bedrooms < filter.minBed) return false
    if (filter.maxPrice && l.price > filter.maxPrice) return false
    if (filter.pets && !l.pets_allowed) return false
    return true
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--warm-white)' }}>
      {/* Header */}
      <header style={{ background: 'var(--deep)', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: 'var(--accent)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '600', color: 'white', lineHeight: 1.1 }}>Find Your Next Home</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Curated by Kupa · KW Atlantic Partners</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', padding: '6px 12px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--sand)" strokeWidth="2"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5"/><circle cx="16" cy="17" r="3"/><circle cx="7" cy="17" r="3"/></svg>
              <span style={{ fontSize: '11px', color: 'var(--sand)', fontWeight: '500', whiteSpace: 'nowrap' }}>Drive times from Cocoa, FL</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border)', padding: '28px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: '300', color: 'var(--charcoal)', lineHeight: 1.1, marginBottom: '8px' }}>
            Homes Selected <em>Just For You</em>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '500px' }}>
            Each listing includes estimated drive time from your workplace at 3732 US-1, Cocoa. Click any home for full details and photos.
          </p>
        </div>
      </div>

      {/* Filter + View Toggle bar */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '12px 24px', position: 'sticky', top: '72px', zIndex: 90 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}><div className='filter-bar'>
          <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Filter:</span>
          <FilterPill options={['Any', '1+', '2+', '3+', '4+']} onChange={v => setFilter(f => ({ ...f, minBed: v === 'Any' ? 0 : parseInt(v) }))} />
          <FilterPill options={['Any Price', 'Under $1,500', 'Under $2,000', 'Under $2,500', 'Under $3,000']} onChange={v => {
            const map = { 'Any Price': 0, 'Under $1,500': 1500, 'Under $2,000': 2000, 'Under $2,500': 2500, 'Under $3,000': 3000 }
            setFilter(f => ({ ...f, maxPrice: map[v] || 0 }))
          }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={filter.pets} onChange={e => setFilter(f => ({ ...f, pets: e.target.checked }))} />
            Pets OK
          </label>

          {/* View toggle */}
          <div style={{ marginLeft: 'auto', display: 'flex', background: 'var(--cream)', borderRadius: '8px', padding: '3px', gap: '2px' }}>
            <ViewBtn active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Grid
            </ViewBtn>
            <ViewBtn active={viewMode === 'map'} onClick={() => setViewMode('map')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7M9 20l6-3M9 20V7m6 13l4.553 2.276A1 1 0 0 0 21 21.382V10.618a1 1 0 0 0-.553-.894L15 7m0 13V7M9 7l6-3"/></svg>
              Map
            </ViewBtn>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Sort:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ fontSize: '12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', padding: '4px 8px', background: 'white', color: 'var(--charcoal)', cursor: 'pointer' }}>
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>

          <span style={{ fontSize: '11px', color: 'var(--muted)', flexShrink: 0 }}>{filtered.length} home{filtered.length !== 1 ? 's' : ''}</span></div>
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: viewMode === 'map' ? '24px' : '40px 24px 80px' }}>
        {loading ? (
          <div className='listing-grid'>
            {[1,2,3].map(i => (
              <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', background: 'white', boxShadow: 'var(--shadow-card)' }}>
                <div className="skeleton" style={{ height: '220px' }} />
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="skeleton" style={{ height: '24px', width: '55%' }} />
                  <div className="skeleton" style={{ height: '14px', width: '75%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '300', marginBottom: '10px' }}>
              {listings.length === 0 ? 'Listings Coming Soon' : 'No homes match your filters'}
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
              {listings.length === 0 ? 'Check back shortly — Kupa is curating homes for you.' : 'Try adjusting your filters above.'}
            </p>
          </div>
        ) : viewMode === 'map' ? (
          <div style={{ height: 'calc(100vh - 220px)', minHeight: '500px', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            <MapView
              listings={filtered}
              selectedId={mapSelected?.id}
              onSelectListing={setMapSelected}
              onInterest={setSelectedListing}
            />
          </div>
        ) : (
          <div className='listing-grid'>
            {filtered.map((listing, i) => (
              <div key={listing.id} style={{ animationDelay: `${i * 0.07}s` }}>
                <ListingCard listing={listing} onInterest={setSelectedListing} />
              </div>
            ))}
          </div>
        )}
      </main>

      <footer style={{ background: 'var(--deep)', color: 'rgba(255,255,255,0.4)', padding: '28px 24px', textAlign: 'center', fontSize: '12px' }}>
        <p>Curated by <span style={{ color: 'white', fontWeight: '500' }}>Kupa</span> · Keller Williams Atlantic Partners · Jacksonville, FL</p>
        <p style={{ marginTop: '6px' }}>Licensed REALTOR® · <a href="mailto:kupadoesrealestate@gmail.com" style={{ color: 'var(--sand)' }}>kupadoesrealestate@gmail.com</a></p>
      </footer>

      {selectedListing && <InterestModal listing={selectedListing} onClose={() => setSelectedListing(null)} />}
    </div>
  )
}

function FilterPill({ options, onChange }) {
  return (
    <select onChange={e => onChange(e.target.value)} style={{ fontSize: '12px', border: '1px solid var(--border-strong)', borderRadius: '100px', padding: '5px 12px', background: 'white', color: 'var(--charcoal)', cursor: 'pointer' }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function ViewBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', border: 'none', background: active ? 'white' : 'transparent', color: active ? 'var(--charcoal)' : 'var(--muted)', fontSize: '12px', fontWeight: active ? '500' : '400', cursor: 'pointer', boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s', fontFamily: 'var(--font-body)' }}>
      {children}
    </button>
  )
}
