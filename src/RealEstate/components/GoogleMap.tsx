'use client'

import { useEffect, useRef, useState } from 'react'

interface GoogleMapProps {
  address?: string
  lat?: number | string
  lng?: number | string
  height?: string
  className?: string
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export function GoogleMap({
  address,
  lat,
  lng,
  height = '400px',
  className = ''
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setMapError('Google Maps API key is not configured')
      return
    }

    // Check if script is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      return
    }

    // Load Google Maps script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      setIsLoaded(true)
    }

    script.onerror = () => {
      setMapError('Failed to load Google Maps')
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup script if component unmounts before script loads
      if (!window.google) {
        const existingScript = document.querySelector(
          `script[src*="maps.googleapis.com"]`
        )
        if (existingScript) {
          document.head.removeChild(existingScript)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return

    let map: any
    let marker: any

    const initializeMap = () => {
      // Try to get coordinates
      let mapLat: number | undefined
      let mapLng: number | undefined

      if (lat && lng) {
        mapLat = typeof lat === 'string' ? parseFloat(lat) : lat
        mapLng = typeof lng === 'string' ? parseFloat(lng) : lng
      }

      // Default center (fallback)
      const defaultCenter = { lat: 40.7128, lng: -74.006 }

      if (mapLat && mapLng && !isNaN(mapLat) && !isNaN(mapLng)) {
        // Use provided coordinates
        map = new window.google.maps.Map(mapRef.current!, {
          center: { lat: mapLat, lng: mapLng },
          zoom: 15,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })

        marker = new window.google.maps.Marker({
          position: { lat: mapLat, lng: mapLng },
          map,
          title: address || 'Property Location'
        })
      } else if (address) {
        // Geocode the address
        const geocoder = new window.google.maps.Geocoder()

        geocoder.geocode({ address }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location

            map = new window.google.maps.Map(mapRef.current!, {
              center: { lat: location.lat(), lng: location.lng() },
              zoom: 15,
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }]
                }
              ]
            })

            marker = new window.google.maps.Marker({
              position: { lat: location.lat(), lng: location.lng() },
              map,
              title: address
            })
          } else {
            setMapError('Unable to find the location')
          }
        })
      } else {
        // No address or coordinates - show default map
        map = new window.google.maps.Map(mapRef.current!, {
          center: defaultCenter,
          zoom: 10
        })
        setMapError('No location information available')
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializeMap, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [isLoaded, address, lat, lng])

  if (mapError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
        style={{ height }}
      >
        <p className='text-gray-600 dark:text-gray-400'>{mapError}</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
        style={{ height }}
      >
        <p className='text-gray-600 dark:text-gray-400'>Loading map...</p>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className={`rounded-lg overflow-hidden ${className}`}
      style={{ height, minHeight: '300px' }}
    />
  )
}

