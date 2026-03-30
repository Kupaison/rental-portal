import React from 'react'
import { useDriveTime } from '../lib/driveTime'

export default function DriveTimeBadge({ address, compact = false }) {
  const { data, loading, mapsUrl } = useDriveTime(address)

  if (compact) {
    return (
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          background: 'rgba(181, 72, 42, 0.08)', border: '1px solid rgba(181, 72, 42, 0.2)',
          borderRadius: '100px', padding: '4px 10px', fontSize: '11px', fontWeight: '500',
          color: 'var(--accent)', textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap'
        }}
        title="Drive time from your workplace"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5"/>
          <circle cx="16" cy="17" r="3"/><circle cx="7" cy="17" r="3"/>
        </svg>
        {loading ? '…' : (data?.inTraffic || data?.duration || 'Map')}
      </a>
    )
  }

  return (
    <div style={{
      background: 'var(--cream)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '14px 16px',
    }}>
      <div style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
        Commute from your workplace
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
        {/* Time display */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexShrink: 0 }}>
          <span style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: '300', color: 'var(--accent)', lineHeight: 1 }}>
            {loading ? '—' : (data?.inTraffic || data?.duration || '—')}
          </span>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>in traffic</div>
            {!loading && data?.distance && (
              <div style={{ fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{data.distance}</div>
            )}
          </div>
        </div>

        {/* Maps link */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginLeft: 'auto', fontSize: '12px', fontWeight: '500', color: 'var(--accent)',
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '6px 14px', border: '1px solid rgba(181,72,42,0.3)',
            borderRadius: '100px', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
            textDecoration: 'none'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent)' }}
        >
          Open in Maps ↗
        </a>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
        From: 3732 US-1, Cocoa FL
      </div>
    </div>
  )
}
