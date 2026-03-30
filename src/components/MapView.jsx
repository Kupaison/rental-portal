import React, { useEffect, useRef, useState } from 'react'
import { WORK_ADDRESS } from '../lib/supabase'
import { useDriveTime } from '../lib/driveTime'

// Individual map pin with drive time
function ListingPin({ listing, map, onSelect, selected }) {
  const markerRef = useRef(null)
  const infoRef = useRef(null)
  const fullAddress = `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`
  const { data: driveData } = useDriveTime(fullAddress)

  useEffect(() => {
    if (!map || !window.google) return

    // Use lat/lng if stored, otherwise geocode
    const position = listing.lat && listing.lng
      ? { lat: parseFloat(listing.lat), lng: parseFloat(listing.lng) }
      : null

    if (!position) {
      // Geocode the address
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          createMarker(results[0].geometry.location)
        }
      })
    } else {
      createMarker(position)
    }

    function createMarker(pos) {
      // Custom marker
      const marker = new window.google.maps.Marker({
        position: pos,
        map,
        title: listing.address,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: selected ? '#B5482A' : '#1C1C1A',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
        }
      })

      // Info window
      const content = `
        <div style="font-family: 'DM Sans', sans-serif; min-width: 200px; padding: 4px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${listing.address}</div>
          <div style="color: #7A7570; font-size: 12px; margin-bottom: 8px;">${listing.city}, ${listing.state}</div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 16px; font-weight: 600; color: #1C1C1A;">$${listing.price.toLocaleString()}<span style="font-size: 11px; font-weight: 400; color: #7A7570;">/mo</span></span>
            ${driveData ? `<span style="background: rgba(181,72,42,0.1); color: #B5482A; padding: 3px 8px; border-radius: 100px; font-size: 11px; font-weight: 500;">🚗 ${driveData.inTraffic || driveData.duration}</span>` : ''}
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #7A7570;">${listing.bedrooms || '?'}bd · ${listing.bathrooms || '?'}ba${listing.sqft ? ` · ${listing.sqft.toLocaleString()} sqft` : ''}</div>
        </div>
      `

      const infoWindow = new window.google.maps.InfoWindow({ content })
      infoRef.current = infoWindow

      marker.addListener('click', () => {
        onSelect(listing)
        infoWindow.open(map, marker)
      })

      markerRef.current = marker
    }

    return () => {
      if (markerRef.current) markerRef.current.setMap(null)
      if (infoRef.current) infoRef.current.close()
    }
  }, [map, listing, driveData, selected])

  // Update marker color when selected changes
  useEffect(() => {
    if (markerRef.current && window.google) {
      markerRef.current.setIcon({
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: selected ? 13 : 10,
        fillColor: selected ? '#B5482A' : '#1C1C1A',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2,
      })
    }
  }, [selected])

  return null
}

// Work location marker
function WorkMarker({ map }) {
  useEffect(() => {
    if (!map || !window.google) return
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address: WORK_ADDRESS }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const marker = new window.google.maps.Marker({
          position: results[0].geometry.location,
          map,
          title: 'Your Workplace',
          icon: {
            path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: '#3A7D44',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2,
          },
          zIndex: 999
        })
        const iw = new window.google.maps.InfoWindow({
          content: `<div style="font-family: 'DM Sans', sans-serif; padding: 4px;"><div style="font-weight: 600; font-size: 13px; color: #3A7D44;">📍 Your Workplace</div><div style="font-size: 11px; color: #7A7570; margin-top: 3px;">${WORK_ADDRESS}</div></div>`
        })
        marker.addListener('click', () => iw.open(map, marker))
        return () => marker.setMap(null)
      }
    })
  }, [map])
  return null
}

export default function MapView({ listings, onSelectListing, selectedId, onInterest }) {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey || apiKey === 'your_google_maps_api_key') {
      setMapError(true)
      return
    }

    function initMap() {
      if (!mapRef.current) return
      const m = new window.google.maps.Map(mapRef.current, {
        center: { lat: 28.5, lng: -81.2 }, // Central Florida
        zoom: 9,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          { elementType: 'geometry', stylers: [{ color: '#f5f0e8' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
          { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#f5f0e8' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#b8d4e8' }] },
        ]
      })
      setMap(m)
    }

    if (window.google?.maps) {
      initMap()
      return
    }

    const scriptId = 'google-maps-script'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`
      script.async = true
      script.onload = initMap
      script.onerror = () => setMapError(true)
      document.head.appendChild(script)
    } else {
      // Script already loading, wait for it
      const interval = setInterval(() => {
        if (window.google?.maps) { clearInterval(interval); initMap() }
      }, 100)
    }
  }, [])

  const selectedListing = listings.find(l => l.id === selectedId)

  if (mapError) return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'var(--cream)', borderRadius: '12px', padding: '40px' }}>
      <div style={{ fontSize: '40px' }}>🗺️</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '400' }}>Map Unavailable</div>
      <p style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', maxWidth: '300px' }}>
        Add your Google Maps API key in Vercel environment variables to enable the map view.
      </p>
      <code style={{ background: 'var(--charcoal)', color: 'var(--sand)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px' }}>
        VITE_GOOGLE_MAPS_API_KEY
      </code>
    </div>
  )

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Map */}
      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }} />

      {/* Markers */}
      {map && listings.map(l => (
        <ListingPin
          key={l.id}
          listing={l}
          map={map}
          onSelect={onSelectListing}
          selected={l.id === selectedId}
        />
      ))}
      {map && <WorkMarker map={map} />}

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: '16px', left: '16px',
        background: 'white', borderRadius: '8px', padding: '10px 14px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)', fontSize: '12px',
        display: 'flex', flexDirection: 'column', gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#1C1C1A', border: '2px solid white', boxShadow: '0 0 0 1px #1C1C1A' }} />
          <span style={{ color: 'var(--charcoal)' }}>Rental listing</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#B5482A', border: '2px solid white', boxShadow: '0 0 0 1px #B5482A' }} />
          <span style={{ color: 'var(--charcoal)' }}>Selected</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', background: '#3A7D44', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', transform: 'rotate(180deg)' }} />
          <span style={{ color: 'var(--charcoal)' }}>Your workplace</span>
        </div>
      </div>

      {/* Selected listing card */}
      {selectedListing && (
        <div style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'white', borderRadius: '12px', padding: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)', maxWidth: '260px', width: '100%',
          animation: 'fadeUp 0.2s ease'
        }}>
          {selectedListing.listing_photos?.[0] && (
            <img
              src={selectedListing.listing_photos[0].public_url}
              alt=""
              style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
            />
          )}
          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>{selectedListing.address}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '10px' }}>{selectedListing.city}, {selectedListing.state}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', marginBottom: '12px' }}>
            ${selectedListing.price.toLocaleString()}<span style={{ fontSize: '13px', fontWeight: '300', color: 'var(--muted)' }}>/mo</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => window.location.href = `/listing/${selectedListing.id}`}
              style={{ flex: 1, padding: '8px', background: 'var(--charcoal)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
            >
              View Details
            </button>
            <button
              onClick={() => onInterest(selectedListing)}
              style={{ flex: 1, padding: '8px', background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
            >
              Interested
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
