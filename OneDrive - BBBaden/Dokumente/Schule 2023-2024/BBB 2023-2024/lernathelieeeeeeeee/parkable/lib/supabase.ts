import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. App will run in demo mode.')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface ParkingSpot {
  id: string
  latitude: number
  longitude: number
  status: 'free' | 'occupied'
  reported_by?: string
  reported_at?: string
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  email?: string
  username?: string
  points: number
  level: number
  created_at?: string
  updated_at?: string
}

export interface Report {
  id: string
  parking_spot_id: string
  user_id?: string
  status: 'free' | 'occupied'
  points_earned: number
  created_at?: string
}

// Parking Spots Functions
export async function getParkingSpots(lat?: number, lng?: number, radius?: number) {
  if (!supabase) {
    // Demo mode - return empty array
    return []
  }

  try {
    let query = supabase
      .from('parking_spots')
      .select('*')
      .order('reported_at', { ascending: false })

    if (lat && lng && radius) {
      // Use PostGIS for location-based queries if available
      // For now, fetch all and filter client-side
      const { data, error } = await query
      if (error) throw error
      return data as ParkingSpot[]
    }

    const { data, error } = await query.limit(100)
    if (error) throw error
    return data as ParkingSpot[]
  } catch (error) {
    console.error('Error fetching parking spots:', error)
    return []
  }
}

export async function createParkingSpot(spot: {
  latitude: number
  longitude: number
  status: 'free' | 'occupied'
  reported_by?: string
}) {
  if (!supabase) {
    // Demo mode - return mock data
    return {
      id: Date.now().toString(),
      ...spot,
      reported_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  try {
    const { data, error } = await supabase
      .from('parking_spots')
      .insert([spot])
      .select()
      .single()

    if (error) throw error
    return data as ParkingSpot
  } catch (error) {
    console.error('Error creating parking spot:', error)
    throw error
  }
}

export async function updateParkingSpot(
  id: string,
  updates: {
    status?: 'free' | 'occupied'
    reported_by?: string
  }
) {
  if (!supabase) {
    // Demo mode - return mock data
    return {
      id,
      ...updates,
      reported_at: new Date().toISOString(),
    }
  }

  try {
    const { data, error } = await supabase
      .from('parking_spots')
      .update({
        ...updates,
        reported_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as ParkingSpot
  } catch (error) {
    console.error('Error updating parking spot:', error)
    throw error
  }
}

export async function createReport(report: {
  parking_spot_id: string
  user_id?: string
  status: 'free' | 'occupied'
  points_earned?: number
}) {
  if (!supabase) {
    // Demo mode - return mock data
    return {
      id: Date.now().toString(),
      ...report,
      points_earned: report.points_earned || 10,
      created_at: new Date().toISOString(),
    }
  }

  try {
    const { data, error } = await supabase
      .from('reports')
      .insert([report])
      .select()
      .single()

    if (error) throw error
    return data as Report
  } catch (error) {
    console.error('Error creating report:', error)
    throw error
  }
}

// User Functions
export async function getUser(userId: string) {
  if (!supabase) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data as User
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function getTopUsers(limit: number = 10) {
  if (!supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('points', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as User[]
  } catch (error) {
    console.error('Error fetching top users:', error)
    return []
  }
}

