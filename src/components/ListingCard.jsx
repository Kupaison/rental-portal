import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DriveTimeBadge from './DriveTimeBadge'

export default function ListingCard({ listing, onInterest }) {
  const navigate = useNavigate()
  const [imgIdx, setImgIdx] = useState(0)
  const photos = listing.listing_photos || []
  const mainPhoto = photos[imgIdx]?.public_url

  const fullAddress = `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        transition: 'box-shadow 0.3s, transform 0.3s',
        cursor: 'pointer',
        animation: 'fadeUp 0.5s ease forwards',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
        e.currentTarget.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
      onClick={() => navigate(`/listing/${listing.id}`)}
    >
      {/* Photo */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--sand-light)' }}>
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt={listing.address}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sand-light)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--sand)" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="m21 15-5-5L5 21"/>
            </svg>
          </div>
        )}

        {/* Photo count */}
        {photos.length > 1 && (
          <div style={{
            position: 'absolute', bottom: '10px', right: '10px',
            background: 'rgba(0,0,0,0.55)', color: 'white',
            borderRadius: '100px', padding: '3px 10px', fontSize: '11px', fontWeight: '500',
            backdropFilter: 'blur(4px)'
          }}>
            {photos.length} photos
          </div>
        )}

        {/* Featured tag */}
        {listing.featured && (
          <div style={{
            position: 'absolute', top: '12px', left: '12px',
            background: 'var(--accent)', color: 'white',
            padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '500',
            letterSpacing: '0.05em', textTransform: 'uppercase'
          }}>
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        {/* Price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '600', color: 'var(--charcoal)', lineHeight: 1 }}>
              ${listing.price.toLocaleString()}<span style={{ fontSize: '14px', fontWeight: '300', color: 'var(--muted)' }}>/mo</span>
            </div>
            {listing.available_date && (
              <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '500', marginTop: '4px' }}>
                Available {listing.available_date}
              </div>
            )}
          </div>
          <DriveTimeBadge address={fullAddress} compact />
        </div>

        {/* Address */}
        <div>
          <div style={{ fontWeight: '500', fontSize: '14px', color: 'var(--charcoal)' }}>{listing.address}</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{listing.city}, {listing.state} {listing.zip}</div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '16px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          <Stat icon={BedIcon} value={listing.bedrooms} label="bd" />
          <Stat icon={BathIcon} value={listing.bathrooms} label="ba" />
          {listing.sqft && <Stat icon={SqftIcon} value={listing.sqft.toLocaleString()} label="sqft" />}
          {listing.pets_allowed && (
            <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--success)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '3px' }}>
              🐾 Pets OK
            </div>
          )}
        </div>

        {/* Interest button */}
        <button
          onClick={e => { e.stopPropagation(); onInterest(listing) }}
          style={{
            marginTop: 'auto',
            background: 'var(--charcoal)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius)',
            padding: '11px 20px',
            fontSize: '13px',
            fontWeight: '500',
            letterSpacing: '0.03em',
            transition: 'background 0.2s',
            width: '100%'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--charcoal)'}
        >
          I'm Interested — Contact Kupa
        </button>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Icon />
      <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--charcoal)' }}>{value}</span>
      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{label}</span>
    </div>
  )
}

const BedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
    <path d="M2 4v16M2 8h20M22 8v12M6 8v4M2 16h20"/>
  </svg>
)

const BathIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>
    <line x1="10" y1="5" x2="8" y2="7"/><path d="M4 9h16"/>
  </svg>
)

const SqftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 9h18M9 21V9"/>
  </svg>
)
