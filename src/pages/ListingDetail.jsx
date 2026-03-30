import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import DriveTimeBadge from '../components/DriveTimeBadge'
import InterestModal from '../components/InterestModal'

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)
  const [showInterest, setShowInterest] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    loadListing()
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ fontSize: '48px' }}>🏠</div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px' }}>Listing not found</p>
      <button onClick={() => navigate('/')} style={{ padding: '10px 24px', background: 'var(--charcoal)', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
        ← Back to Listings
      </button>
    </div>
  )

  const photos = listing.listing_photos || []
  const fullAddress = `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--warm-white)' }}>
      {/* Nav */}
      <div style={{ background: 'var(--deep)', padding: '16px 40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          ← All Listings
        </button>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>{listing.address}</span>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 40px 80px' }}>
        {/* Photo gallery */}
        {photos.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            {/* Main photo */}
            <div
              style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9', background: 'var(--sand-light)', cursor: 'zoom-in', marginBottom: '12px', position: 'relative' }}
              onClick={() => setLightbox(activePhoto)}
            >
              <img
                src={photos[activePhoto]?.public_url}
                alt={photos[activePhoto]?.label || listing.address}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {photos[activePhoto]?.label && (
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(0,0,0,0.55)', color: 'white', padding: '5px 14px', borderRadius: '100px', fontSize: '13px', backdropFilter: 'blur(4px)' }}>
                  {photos[activePhoto].label}
                </div>
              )}
              <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(0,0,0,0.4)', color: 'white', padding: '4px 10px', borderRadius: '100px', fontSize: '11px' }}>
                🔍 Click to enlarge
              </div>
            </div>

            {/* Thumbnails */}
            {photos.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {photos.map((photo, i) => (
                  <div
                    key={photo.id}
                    onClick={() => setActivePhoto(i)}
                    style={{
                      flexShrink: 0, width: '90px', height: '67px',
                      borderRadius: '6px', overflow: 'hidden', cursor: 'pointer',
                      border: i === activePhoto ? '2px solid var(--accent)' : '2px solid transparent',
                      opacity: i === activePhoto ? 1 : 0.7,
                      transition: 'all 0.2s'
                    }}
                  >
                    <img src={photo.public_url} alt={photo.label || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px', alignItems: 'start' }}>
          {/* Left: Info */}
          <div>
            <div style={{ marginBottom: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {listing.featured && <Tag color="var(--accent)">Featured</Tag>}
              {listing.pets_allowed && <Tag color="var(--success)">🐾 Pets Allowed</Tag>}
              {listing.available_date && <Tag color="var(--charcoal)">Available {listing.available_date}</Tag>}
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: '400', lineHeight: 1.1, marginBottom: '6px' }}>
              {listing.address}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '16px', marginBottom: '24px' }}>
              {listing.city}, {listing.state} {listing.zip}
            </p>

            {/* Key stats */}
            <div style={{ display: 'flex', gap: '0', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '28px' }}>
              {[
                { value: `${listing.bedrooms}`, label: 'Bedrooms' },
                { value: `${listing.bathrooms}`, label: 'Bathrooms' },
                listing.sqft && { value: listing.sqft.toLocaleString(), label: 'Sq Ft' },
              ].filter(Boolean).map((stat, i, arr) => (
                <div key={i} style={{
                  flex: 1, padding: '20px', textAlign: 'center',
                  borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                  background: 'white'
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '600', color: 'var(--charcoal)' }}>{stat.value}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Drive time */}
            <div style={{ marginBottom: '28px' }}>
              <DriveTimeBadge address={fullAddress} />
            </div>

            {/* Description */}
            {listing.description && (
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '500', marginBottom: '12px' }}>About This Home</h3>
                <p style={{ color: 'var(--charcoal)', lineHeight: 1.75, fontSize: '15px' }}>{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '500', marginBottom: '14px' }}>Amenities</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {listing.amenities.map(a => (
                    <span key={a} style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '100px', padding: '5px 14px', fontSize: '13px', color: 'var(--charcoal)' }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Details grid */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '500', marginBottom: '14px' }}>Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                {[
                  listing.parking && ['Parking', listing.parking],
                  listing.laundry && ['Laundry', listing.laundry],
                  ['Pets', listing.pets_allowed ? 'Allowed' : 'Not allowed'],
                  listing.available_date && ['Available', listing.available_date],
                ].filter(Boolean).map(([label, value], i) => (
                  <div key={label} style={{ padding: '14px 18px', background: i % 2 === 0 ? 'white' : 'var(--warm-white)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--charcoal)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sticky CTA */}
          <div style={{ position: 'sticky', top: '24px' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '600', marginBottom: '4px' }}>
                ${listing.price.toLocaleString()}<span style={{ fontSize: '16px', fontWeight: '300', color: 'var(--muted)' }}>/month</span>
              </div>
              {listing.available_date && (
                <div style={{ fontSize: '13px', color: 'var(--success)', fontWeight: '500', marginBottom: '20px' }}>
                  ✓ Available {listing.available_date}
                </div>
              )}

              <button
                onClick={() => setShowInterest(true)}
                style={{
                  width: '100%', padding: '15px', background: 'var(--charcoal)', color: 'white',
                  border: 'none', borderRadius: 'var(--radius)', fontSize: '15px', fontWeight: '500',
                  cursor: 'pointer', transition: 'background 0.2s', marginBottom: '12px'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--charcoal)'}
              >
                I'm Interested — Contact Kupa
              </button>

              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(fullAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', width: '100%', padding: '13px', textAlign: 'center',
                  border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)',
                  fontSize: '13px', fontWeight: '500', color: 'var(--charcoal)', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--charcoal)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
              >
                View on Google Maps ↗
              </a>

              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>Your agent</div>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>Kupa</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>KW Atlantic Partners</div>
                <a href="mailto:kupadoesrealestate@gmail.com" style={{ fontSize: '12px', color: 'var(--accent)', display: 'block', marginTop: '4px' }}>
                  kupadoesrealestate@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setLightbox(null)}
        >
          <img src={photos[lightbox]?.public_url} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }} onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: 'pointer' }}>×</button>
          {photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setLightbox(l => (l - 1 + photos.length) % photos.length) }} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: '44px', height: '44px', fontSize: '20px', cursor: 'pointer' }}>‹</button>
              <button onClick={e => { e.stopPropagation(); setLightbox(l => (l + 1) % photos.length) }} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: '44px', height: '44px', fontSize: '20px', cursor: 'pointer' }}>›</button>
            </>
          )}
        </div>
      )}

      {showInterest && <InterestModal listing={listing} onClose={() => setShowInterest(false)} />}
    </div>
  )
}

function Tag({ color, children }) {
  return (
    <span style={{ background: color, color: 'white', padding: '3px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '500', letterSpacing: '0.04em' }}>
      {children}
    </span>
  )
}
