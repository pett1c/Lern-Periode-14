'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { Icon } from 'leaflet'
import { MapPin, X } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Next.js
delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface ParkingSpot {
  id: string
  lat: number
  lng: number
  status: 'free' | 'occupied'
  reportedBy?: string
  reportedAt?: Date
}

interface MapContentProps {
  center: [number, number]
  zoom: number
  parkingSpots: ParkingSpot[]
  setParkingSpots: (spots: ParkingSpot[]) => void
  showAddSpot: boolean
  setShowAddSpot: (show: boolean) => void
  onAddSpot?: (lat: number, lng: number) => void
  onStatusChange?: (id: string, status: 'free' | 'occupied') => void
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Singleton pattern to ensure map is only initialized once
let mapInstanceId = 0
const activeMapInstances = new Set<string>()

function MapContent({
  center,
  zoom,
  parkingSpots,
  setParkingSpots,
  showAddSpot,
  setShowAddSpot,
  onAddSpot,
  onStatusChange,
}: MapContentProps) {
  const [newSpotLocation, setNewSpotLocation] = useState<[number, number] | null>(null)
  const [mounted, setMounted] = useState(false)
  const mapIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Only mount on client side, after component is mounted
    if (typeof window !== 'undefined') {
      if (!mapIdRef.current) {
        mapInstanceId++
        mapIdRef.current = `map-instance-${mapInstanceId}`
        activeMapInstances.add(mapIdRef.current)
      }
      setMounted(true)
      
      return () => {
        // Cleanup: remove from active instances when component unmounts
        if (mapIdRef.current) {
          activeMapInstances.delete(mapIdRef.current)
        }
      }
    }
  }, [])

  const handleMapClick = (lat: number, lng: number) => {
    if (showAddSpot) {
      setNewSpotLocation([lat, lng])
    }
  }

  const handleAddSpot = () => {
    if (newSpotLocation && onAddSpot) {
      onAddSpot(newSpotLocation[0], newSpotLocation[1])
      setNewSpotLocation(null)
      setShowAddSpot(false)
    } else if (newSpotLocation) {
      // Fallback to local state if callback not provided
      const newSpot: ParkingSpot = {
        id: Date.now().toString(),
        lat: newSpotLocation[0],
        lng: newSpotLocation[1],
        status: 'free',
        reportedAt: new Date(),
      }
      setParkingSpots([...parkingSpots, newSpot])
      setNewSpotLocation(null)
      setShowAddSpot(false)
    }
  }

  const handleStatusChange = (id: string, newStatus: 'free' | 'occupied') => {
    if (onStatusChange) {
      onStatusChange(id, newStatus)
    } else {
      // Fallback to local state if callback not provided
      setParkingSpots(
        parkingSpots.map((spot) =>
          spot.id === id ? { ...spot, status: newStatus, reportedAt: new Date() } : spot
        )
      )
    }
  }

  const getMarkerIcon = (status: 'free' | 'occupied') => {
    return new Icon({
      iconUrl: status === 'free' 
        ? 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        `)
        : 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        `),
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })
  }

  if (!mounted || !mapIdRef.current) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary-500" />
          <p className="text-lg">Karte wird geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        key={mapIdRef.current}
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onMapClick={handleMapClick} />

        {/* User Location Marker */}
        <Marker position={center} icon={new Icon({
          iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6" stroke="#fff" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
          `),
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })}>
          <Popup>Dein Standort</Popup>
        </Marker>

        {/* Parking Spots */}
        {parkingSpots.map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.lat, spot.lng]}
            icon={getMarkerIcon(spot.status)}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold mb-2">
                  Status: {spot.status === 'free' ? '🟢 Frei' : '🔴 Belegt'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(spot.id, 'free')}
                    className={`px-3 py-1 rounded text-sm ${
                      spot.status === 'free'
                        ? 'bg-green-500 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    Frei
                  </button>
                  <button
                    onClick={() => handleStatusChange(spot.id, 'occupied')}
                    className={`px-3 py-1 rounded text-sm ${
                      spot.status === 'occupied'
                        ? 'bg-red-500 text-white'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    Belegt
                  </button>
                </div>
                {spot.reportedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Gemeldet: {new Date(spot.reportedAt).toLocaleString('de-CH')}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* New Spot Preview */}
        {showAddSpot && newSpotLocation && (
          <Marker position={newSpotLocation} icon={getMarkerIcon('free')}>
            <Popup>
              <div className="p-2">
                <p className="font-semibold mb-2">Neuer Parkplatz</p>
                <button
                  onClick={handleAddSpot}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  Hinzufügen
                </button>
                <button
                  onClick={() => {
                    setNewSpotLocation(null)
                    setShowAddSpot(false)
                  }}
                  className="w-full mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                >
                  Abbrechen
                </button>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Instructions Overlay */}
      {showAddSpot && (
        <div className="absolute top-4 left-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-[1000]">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Klicke auf die Karte, um einen neuen Parkplatz hinzuzufügen</p>
            <button
              onClick={() => {
                setShowAddSpot(false)
                setNewSpotLocation(null)
              }}
              className="ml-4 p-1 hover:bg-blue-600 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapContent
