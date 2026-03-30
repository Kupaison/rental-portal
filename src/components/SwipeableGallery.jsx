import React, { useState, useRef, useEffect } from 'react'

export default function SwipeableGallery({ photos, onOpenLightbox }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragOffset, setDragOffset] = useState(0)
  const trackRef = useRef()

  const SWIPE_THRESHOLD = 50

  function getClientX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX
  }

  function handleStart(e) {
    setDragging(true)
    setDragStart(getClientX(e))
    setDragOffset(0)
  }

  function handleMove(e) {
    if (!dragging || dragStart === null) return
    const delta = getClientX(e) - dragStart
    setDragOffset(delta)
  }

  function handleEnd() {
    if (!dragging) return
    setDragging(false)
    if (dragOffset < -SWIPE_THRESHOLD && activeIdx < photos.length - 1) {
      setActiveIdx(i => i + 1)
    } else if (dragOffset > SWIPE_THRESHOLD && activeIdx > 0) {
      setActiveIdx(i => i - 1)
    }
    setDragOffset(0)
    setDragStart(null)
  }

  function goTo(idx) {
    setActiveIdx(idx)
    setDragOffset(0)
  }

  // Scroll thumbnail strip to keep active thumb visible
  useEffect(() => {
    const strip = document.getElementById('thumb-strip')
    if (!strip) return
    const thumb = strip.children[activeIdx]
    if (thumb) thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeIdx])

  if (!photos || photos.length === 0) return (
    <div style={{ aspectRatio: '16/9', background: 'var(--sand-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: '48px' }}>🏠</span>
    </div>
  )

  const translateX = `calc(${-activeIdx * 100}% + ${dragOffset}px)`

  return (
    <div style={{ marginBottom: '40px', userSelect: 'none' }}>
      {/* Main swipeable area */}
      <div
        style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9', background: 'var(--sand-light)', cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {/* Sliding track */}
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            width: `${photos.length * 100}%`,
            height: '100%',
            transform: `translateX(${translateX})`,
            transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            willChange: 'transform'
          }}
        >
          {photos.map((photo, i) => (
            <div
              key={photo.id || i}
              style={{ width: `${100 / photos.length}%`, flexShrink: 0, position: 'relative' }}
              onClick={() => { if (Math.abs(dragOffset) < 5) onOpenLightbox(i) }}
            >
              <img
                src={photo.public_url}
                alt={photo.label || ''}
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
              />
            </div>
          ))}
        </div>

        {/* Label overlay */}
        {photos[activeIdx]?.label && (
          <div style={{
            position: 'absolute', bottom: '16px', left: '16px',
            background: 'rgba(0,0,0,0.55)', color: 'white',
            padding: '5px 14px', borderRadius: '100px', fontSize: '13px',
            backdropFilter: 'blur(4px)', pointerEvents: 'none'
          }}>
            {photos[activeIdx].label}
          </div>
        )}

        {/* Counter */}
        <div style={{
          position: 'absolute', bottom: '16px', right: '16px',
          background: 'rgba(0,0,0,0.45)', color: 'white',
          padding: '4px 12px', borderRadius: '100px', fontSize: '12px',
          backdropFilter: 'blur(4px)', pointerEvents: 'none'
        }}>
          {activeIdx + 1} / {photos.length}
        </div>

        {/* Arrow buttons — desktop only */}
        {activeIdx > 0 && (
          <button
            onClick={e => { e.stopPropagation(); goTo(activeIdx - 1) }}
            style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%',
              width: '40px', height: '40px', fontSize: '18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)', transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'white'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.85)'}
          >‹</button>
        )}
        {activeIdx < photos.length - 1 && (
          <button
            onClick={e => { e.stopPropagation(); goTo(activeIdx + 1) }}
            style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%',
              width: '40px', height: '40px', fontSize: '18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)', transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'white'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.85)'}
          >›</button>
        )}

        {/* Zoom hint */}
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'rgba(0,0,0,0.35)', color: 'white',
          padding: '3px 10px', borderRadius: '100px', fontSize: '11px',
          backdropFilter: 'blur(4px)', pointerEvents: 'none'
        }}>
          🔍 Tap to enlarge
        </div>
      </div>

      {/* Dot indicators — mobile */}
      {photos.length > 1 && photos.length <= 10 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === activeIdx ? '20px' : '7px',
                height: '7px',
                borderRadius: '100px',
                background: i === activeIdx ? 'var(--accent)' : 'var(--sand)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.25s'
              }}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip — desktop */}
      {photos.length > 1 && (
        <div
          id="thumb-strip"
          style={{
            display: 'flex', gap: '8px', overflowX: 'auto',
            paddingBottom: '4px', marginTop: '12px',
            scrollbarWidth: 'none'
          }}
        >
          {photos.map((photo, i) => (
            <div
              key={photo.id || i}
              onClick={() => goTo(i)}
              style={{
                flexShrink: 0, width: '90px', height: '67px',
                borderRadius: '6px', overflow: 'hidden', cursor: 'pointer',
                border: i === activeIdx ? '2px solid var(--accent)' : '2px solid transparent',
                opacity: i === activeIdx ? 1 : 0.65,
                transition: 'all 0.2s'
              }}
            >
              <img src={photo.public_url} alt={photo.label || ''} draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
