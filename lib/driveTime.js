import { useState, useEffect } from 'react'
import { WORK_ADDRESS } from '../lib/supabase'

const cache = {}

export function useDriveTime(listingAddress) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!listingAddress) return

    const cacheKey = listingAddress
    if (cache[cacheKey]) {
      setData(cache[cacheKey])
      setLoading(false)
      return
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey || apiKey === 'your_google_maps_api_key') {
      // Demo mode — return mock data
      setTimeout(() => {
        const mockData = { duration: '18 mins', distance: '9.4 mi', inTraffic: '22 mins' }
        cache[cacheKey] = mockData
        setData(mockData)
        setLoading(false)
      }, 800)
      return
    }

    // Use Google Maps Distance Matrix via a CORS proxy approach
    // We'll call via the Maps JavaScript API embed
    const origin = encodeURIComponent(WORK_ADDRESS)
    const destination = encodeURIComponent(listingAddress)

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&mode=driving&departure_time=now&key=${apiKey}`

    fetch(url)
      .then(r => r.json())
      .then(json => {
        const element = json?.rows?.[0]?.elements?.[0]
        if (element?.status === 'OK') {
          const result = {
            duration: element.duration?.text || 'N/A',
            distance: element.distance?.text || 'N/A',
            inTraffic: element.duration_in_traffic?.text || element.duration?.text || 'N/A'
          }
          cache[cacheKey] = result
          setData(result)
        } else {
          throw new Error('No route found')
        }
      })
      .catch(() => {
        // Fallback: build Google Maps link but show N/A for time
        const fallback = { duration: 'See map', distance: '', inTraffic: 'See map', error: true }
        setData(fallback)
        setError('Could not calculate')
      })
      .finally(() => setLoading(false))
  }, [listingAddress])

  const mapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(WORK_ADDRESS)}/${encodeURIComponent(listingAddress || '')}`

  return { data, loading, error, mapsUrl }
}
