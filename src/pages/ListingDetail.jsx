import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import DriveTimeBadge from '../components/DriveTimeBadge'
import InterestModal from '../components/InterestModal'
import SwipeableGallery from '../components/SwipeableGallery'

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showInterest, setShowInterest] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    loadListing()
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [id])

  async function loadListing() {
    const { data } = await supabase
      .from('listings')
      .select('*, listing_photos(id, public_url, label, sort_order)')
      .eq('id', id)
      .single()
    if (data) {
      data.listing_photos = (data.listing_photos || []).sort((a, b) => a.sort_order - b.sort_order)
      setListing(data)
    }
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--muted)' }}>Loading…</div>
    </div>
  )

  if (!listing) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '20px' }}>
      <div style={{ fontSize: '48px' }}>🏠</div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px' }}>Listing not found</p>
      <button onClick={() => navigate('/')} style={{ padding: '10px 24px', background: 'var(--charcoal)', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
        Back to Listings
      </button>
    </div>
  )

  const photos = listing.listing_photos || []
  const fullAddress = `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--warm-white)' }}>

      {/* Nav */}
      <div style={{ background: 'var(--deep)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '100px', padding: '7px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', flexShrink: 0 }}>
          ← Back
        </button>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.address}</span>
      </div>

      {/* Swipeable Gallery — full width, no side padding */}
      <div style={{ padding: '0' }}>
        <SwipeableGallery photos={photos} onOpenLightbox={(idx) => { setLightboxIdx(idx); setLightbox(true) }} />
      </div>

      {/* Mobile CTA bar — sticky at bottom */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
          background: 'white', borderTop: '1px solid var(--border)',
          padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', lineHeight: 1 }}>
              ${listing.price.toLocaleString()}<span style={{ fontSize: '12px', fontWeight: '300', color: 'var(--muted)' }}>/mo</span>
            </div>
            {listing.available_date && <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '500' }}>Available {listing.available_date}</div>}
          </div>
          <button
            onClick={() => setShowInterest(true)}
            style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius)', padding: '12px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}
          >
            I'm Interested
          </button>
        </div>
      )}

      {/* Main content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '20px 16px 100px' : '32px 32px 80px' }}>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {listing.featured && <Tag color="var(--accent)">Featured</Tag>}
          {listing.pets_allowed && <Tag color="var(--success)">🐾 Pets Allowed</Tag>}
          {listing.available_date && <Tag color="var(--charcoal)">Available {listing.available_date}</Tag>}
        </div>

        {/* Address heading */}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? '30px' : '38px', fontWeight: '400', lineHeight: 1.15, marginBottom: '4px' }}>
          {listing.address}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '24px' }}>
          {listing.city}, {listing.state} {listing.zip}
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '24px' }}>
          {[
            { value: listing.bedrooms ?? '—', label: 'Beds' },
            { value: listing.bathrooms ?? '—', label: 'Baths' },
            listing.sqft && { value: listing.sqft.toLocaleString(), label: 'Sq Ft' },
          ].filter(Boolean).map((s, i, arr) => (
            <div key={i} style={{ flex: 1, padding: isMobile ? '14px 8px' : '20px', textAlign: 'center', borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none', background: 'white' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? '24px' : '32px', fontWeight: '600' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Drive time */}
        <div style={{ marginBottom: '24px' }}>
          <DriveTimeBadge address={fullAddress} />
        </div>

        {/* Desktop two-column / Mobile single column */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 300px', gap: isMobile ? '24px' : '40px', alignItems: 'start' }}>

          {/* Left: Details */}
          <div>
            {listing.description && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '500', marginBottom: '10px' }}>About This Home</h3>
                <p style={{ lineHeight: 1.75, fontSize: '15px', color: 'var(--charcoal)' }}>{listing.description}</p>
              </div>
            )}

            {listing.amenities?.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '500', marginBottom: '12px' }}>Amenities</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {listing.amenities.map(a => (
                    <span key={a} style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '100px', padding: '5px 14px', fontSize: '13px' }}>{a}</span>
                  ))}
                </div>
              </div>
            )}

            {[listing.parking, listing.laundry].some(Boolean) && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '500', marginBottom: '12px' }}>Details</h3>
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  {[
                    listing.parking && ['Parking', listing.parking],
                    listing.laundry && ['Laundry', listing.laundry],
                    ['Pets', listing.pets_allowed ? 'Allowed' : 'Not allowed'],
                    listing.available_date && ['Available', listing.available_date],
                  ].filter(Boolean).map(([label, value], i) => (
                    <div key={label} style={{ padding: '13px 16px', background: i % 2 === 0 ? 'white' : 'var(--warm-white)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '500', textAlign: 'right' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(fullAddress)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--accent)', fontWeight: '500', padding: '10px 0' }}
            >
              View on Google Maps ↗
            </a>
          </div>

          {/* Right: Desktop CTA card only */}
          {!isMobile && (
            <div style={{ position: 'sticky', top: '24px' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '600', marginBottom: '4px' }}>
                  ${listing.price.toLocaleString()}<span style={{ fontSize: '15px', fontWeight: '300', color: 'var(--muted)' }}>/month</span>
                </div>
                {listing.available_date && (
                  <div style={{ fontSize: '13px', color: 'var(--success)', fontWeight: '500', marginBottom: '20px' }}>✓ Available {listing.available_date}</div>
                )}
                <button
                  onClick={() => setShowInterest(true)}
                  style={{ width: '100%', padding: '14px', background: 'var(--charcoal)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginBottom: '10px', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--charcoal)'}
                >
                  I'm Interested — Contact Kupa
                </button>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(fullAddress)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', padding: '12px', textAlign: 'center', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', fontSize: '13px', fontWeight: '500', color: 'var(--charcoal)' }}
                >
                  View on Google Maps ↗
                </a>
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>Your agent</div>
                  <div style={{ fontWeight: '500', fontSize: '14px' }}>Kupa · KW Atlantic Partners</div>
                  <a href="mailto:kupadoesrealestate@gmail.com" style={{ fontSize: '12px', color: 'var(--accent)', display: 'block', marginTop: '4px' }}>
                    kupadoesrealestate@gmail.com
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && photos.length > 0 && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(false)}
        >
          <img
            src={photos[lightboxIdx]?.public_url}
            alt=""
            style={{ maxWidth: '95vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '6px' }}
            onClick={e => e.stopPropagation()}
          />
          <button onClick={() => setLightbox(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: 'pointer' }}>×</button>
          {photos.length > 1 && <>
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + photos.length) % photos.length) }}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: '44px', height: '44px', fontSize: '22px', cursor: 'pointer' }}
            >‹</button>
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % photos.length) }}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: '44px', height: '44px', fontSize: '22px', cursor: 'pointer' }}
            >›</button>
          </>}
          <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: '12px', whiteSpace: 'nowrap' }}>
            {lightboxIdx + 1} / {photos.length}{photos[lightboxIdx]?.label ? ` · ${photos[lightboxIdx].label}` : ''}
          </div>
        </div>
      )}

      {showInterest && <InterestModal listing={listing} onClose={() => setShowInterest(false)} />}
    </div>
  )
}

function Tag({ color, children }) {
  return (
    <span style={{ background: color, color: 'white', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '500', letterSpacing: '0.03em', display: 'inline-block' }}>
      {children}
    </span>
  )
}
