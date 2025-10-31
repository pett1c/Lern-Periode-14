'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Car, MapPin, Plus, TrendingUp, Trophy } from 'lucide-react'
import { getParkingSpots, createParkingSpot, updateParkingSpot, createReport } from '@/lib/supabase'

// Dynamically import map component to avoid SSR issues
const MapContent = dynamic(() => import('@/components/MapContent'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full" style={{ height: '600px' }}>
      <div className="text-center">
        <MapPin className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary-500" />
        <p className="text-lg">Karte wird geladen...</p>
      </div>
    </div>
  )
})

export default function Home() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [parkingSpots, setParkingSpots] = useState<Array<{
    id: string
    lat: number
    lng: number
    status: 'free' | 'occupied'
    reportedAt?: Date
  }>>([])
  const [showAddSpot, setShowAddSpot] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.error('Error getting location:', error)
          // Default to Zurich, Switzerland
          setUserLocation([47.3769, 8.5417])
        }
      )
    } else {
      // Default to Zurich, Switzerland
      setUserLocation([47.3769, 8.5417])
    }
  }, [])

  useEffect(() => {
    // Load parking spots from Supabase
    const loadParkingSpots = async () => {
      try {
        setLoading(true)
        const spots = await getParkingSpots()
        // Transform Supabase data to match component format
        const transformedSpots = spots.map(spot => ({
          id: spot.id,
          lat: spot.latitude,
          lng: spot.longitude,
          status: spot.status as 'free' | 'occupied',
          reportedAt: spot.reported_at ? new Date(spot.reported_at) : undefined,
        }))
        setParkingSpots(transformedSpots)
      } catch (error) {
        console.error('Error loading parking spots:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userLocation) {
      loadParkingSpots()
    }
  }, [userLocation])

  const handleAddSpot = async (lat: number, lng: number) => {
    try {
      const newSpot = await createParkingSpot({
        latitude: lat,
        longitude: lng,
        status: 'free',
      })
      setParkingSpots([...parkingSpots, {
        id: newSpot.id,
        lat: newSpot.latitude,
        lng: newSpot.longitude,
        status: newSpot.status as 'free' | 'occupied',
        reportedAt: newSpot.reported_at ? new Date(newSpot.reported_at) : undefined,
      }])
    } catch (error) {
      console.error('Error adding parking spot:', error)
    }
  }

  const handleStatusChange = async (id: string, newStatus: 'free' | 'occupied') => {
    try {
      await updateParkingSpot(id, { status: newStatus })
      await createReport({
        parking_spot_id: id,
        status: newStatus,
        points_earned: 10,
      })
      setParkingSpots(
        parkingSpots.map((spot) =>
          spot.id === id ? { ...spot, status: newStatus, reportedAt: new Date() } : spot
        )
      )
    } catch (error) {
      console.error('Error updating parking spot:', error)
    }
  }

  if (!userLocation || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary-500" />
          <p className="text-lg">Standort wird geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-800">Parkly</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
                <Trophy className="w-5 h-5" />
                <span className="hidden sm:inline">Punkte: 0</span>
              </button>
              <button
                onClick={() => setShowAddSpot(!showAddSpot)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Parkplatz hinzufügen</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verfügbare Parkplätze</p>
                <p className="text-2xl font-bold text-green-600">{parkingSpots.filter(s => s.status === 'free').length}</p>
              </div>
              <MapPin className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Belegte Parkplätze</p>
                <p className="text-2xl font-bold text-red-600">{parkingSpots.filter(s => s.status === 'occupied').length}</p>
              </div>
              <Car className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Community Reports</p>
                <p className="text-2xl font-bold text-blue-600">{parkingSpots.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden" style={{ height: '600px' }}>
          <MapContent
            center={userLocation}
            zoom={15}
            parkingSpots={parkingSpots}
            setParkingSpots={setParkingSpots}
            showAddSpot={showAddSpot}
            setShowAddSpot={setShowAddSpot}
            onAddSpot={handleAddSpot}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Wie funktioniert Parkly?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">1. Parkplatz finden</h3>
              <p className="text-sm text-gray-600">
                Nutze die Karte, um freie Parkplätze in deiner Nähe zu finden. Grüne Marker zeigen verfügbare Plätze.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold mb-2">2. Status melden</h3>
              <p className="text-sm text-gray-600">
                Melde den Status eines Parkplatzes, wenn du ihn belegst oder freigibst. Du verdienst dabei Punkte!
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold mb-2">3. Punkte sammeln</h3>
              <p className="text-sm text-gray-600">
                Jeder Report gibt dir 10-50 Punkte. Steige auf und erreiche neue Levels!
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold mb-2">4. Community helfen</h3>
              <p className="text-sm text-gray-600">
                Deine Meldungen helfen anderen Fahrern dabei, schneller einen Parkplatz zu finden.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            Parkly - Kostenlose Parkplatz-Finder App | Made with ❤️ by Arvin Ka
          </p>
          <p className="text-xs mt-2 text-gray-400">
            Powered by OpenStreetMap & Supabase
          </p>
        </div>
      </footer>
    </main>
  )
}

