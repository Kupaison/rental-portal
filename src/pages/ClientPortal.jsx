import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ListingCard from '../components/ListingCard'
import InterestModal from '../components/InterestModal'

export default function ClientPortal() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState(null)
  const [filter, setFilter] = useState({ minBed: 0, maxPrice: 0, pets: false })
  const [sortBy, setSortBy] = useState('featured')

  useEffect(() => {
    loadListings()
  }, [])

  async function loadListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('*, listing_photos(public_url, label, sort_order)')
      .eq('active', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (!error && data) {
      // Sort photos within each listing
      const sorted = data.map(l => ({
        ...l,
        listing_photos: (l.listing_photos || []).sort((a, b) => a.sort_order - b.sort_order)
      }))
      setListings(sorted)
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
    if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    return 0
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--warm-white)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--deep)',
        padding: '0 40px',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '38px', height: '38px', background: 'var(--accent)', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '600', color: 'white', lineHeight: 1.1 }}>
                Find Your Next Home
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Curated by Kupa · KW Atlantic Partners
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', padding: '7px 14px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--sand)" strokeWidth="2">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5"/>
              <circle cx="16" cy="17" r="3"/><circle cx="7" cy="17" r="3"/>
            </svg>
            <span style={{ fontSize: '12px', color: 'var(--sand)', fontWeight: '500' }}>Drive times from Cocoa, FL</span>
          </div>
        </div>
      </header>

      {/* Hero bar */}
      <div style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border)', padding: '28px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '300', color: 'var(--charcoal)', lineHeight: 1.1, marginBottom: '8px' }}>
            Homes Selected <em>Just For You</em>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '500px' }}>
            Each listing includes estimated drive time from your workplace at 3732 US-1, Cocoa. Click any home for full details and photos.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '16px 40px', position: 'sticky', top: '72px', zIndex: 90 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Filter:</span>

          <FilterPill
            label="Any Beds"
            options={['Any', '1+', '2+', '3+', '4+']}
            value={filter.minBed}
            onChange={v => setFilter(f => ({ ...f, minBed: v === 'Any' ? 0 : parseInt(v) }))}
          />
          <FilterPill
            label="Any Price"
            options={['Any', 'Under $1,500', 'Under $2,000', 'Under $2,500', 'Under $3,000']}
            value={filter.maxPrice}
            onChange={v => {
              const map = { 'Any': 0, 'Under $1,500': 1500, 'Under $2,000': 2000, 'Under $2,500': 2500, 'Under $3,000': 3000 }
              setFilter(f => ({ ...f, maxPrice: map[v] || 0 }))
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={filter.pets} onChange={e => setFilter(f => ({ ...f, pets: e.target.checked }))} />
            Pets OK
          </label>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ fontSize: '13px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', padding: '5px 10px', background: 'white', color: 'var(--charcoal)', cursor: 'pointer' }}
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
            {filtered.length} home{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Grid */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 40px 80px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', background: 'white', boxShadow: 'var(--shadow-card)' }}>
                <div className="skeleton" style={{ height: '240px' }} />
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="skeleton" style={{ height: '28px', width: '60%' }} />
                  <div className="skeleton" style={{ height: '16px', width: '80%' }} />
                  <div className="skeleton" style={{ height: '16px', width: '40%' }} />
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
              {listings.length === 0 ? 'Check back shortly — Kupa is curating homes for you.' : 'Try adjusting your filter criteria above.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
            {filtered.map((listing, i) => (
              <div key={listing.id} style={{ animationDelay: `${i * 0.08}s` }}>
                <ListingCard listing={listing} onInterest={setSelectedListing} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: 'var(--deep)', color: 'rgba(255,255,255,0.4)', padding: '32px 40px', textAlign: 'center', fontSize: '12px' }}>
        <p>Curated by <span style={{ color: 'white', fontWeight: '500' }}>Kupa</span> · Keller Williams Atlantic Partners · Jacksonville, FL</p>
        <p style={{ marginTop: '6px' }}>Licensed REALTOR® · <a href="mailto:kupadoesrealestate@gmail.com" style={{ color: 'var(--sand)' }}>kupadoesrealestate@gmail.com</a></p>
      </footer>

      {/* Interest Modal */}
      {selectedListing && (
        <InterestModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  )
}

function FilterPill({ options, value, onChange }) {
  return (
    <select
      onChange={e => onChange(e.target.value)}
      style={{
        fontSize: '13px', border: '1px solid var(--border-strong)', borderRadius: '100px',
        padding: '6px 14px', background: 'white', color: 'var(--charcoal)', cursor: 'pointer'
      }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}
