-- Supabase Setup SQL für Parkly
-- Dieses Script erstellt die notwendigen Tabellen und RLS-Policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (für erweiterte Features mit Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  username TEXT,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parking Spots Table
CREATE TABLE IF NOT EXISTS parking_spots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('free', 'occupied')),
  reported_by UUID REFERENCES users(id),
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports Table (für Statistiken und Historie)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parking_spot_id UUID REFERENCES parking_spots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('free', 'occupied')),
  points_earned INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_parking_spots_location ON parking_spots USING GIST (
  ll_to_earth(latitude, longitude)
);
CREATE INDEX IF NOT EXISTS idx_parking_spots_status ON parking_spots(status);
CREATE INDEX IF NOT EXISTS idx_parking_spots_reported_at ON parking_spots(reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers für updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parking_spots_updated_at BEFORE UPDATE ON parking_spots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read parking spots
CREATE POLICY "Anyone can read parking spots" ON parking_spots
  FOR SELECT USING (true);

-- Policy: Anyone can insert parking spots (für Demo ohne Auth)
CREATE POLICY "Anyone can insert parking spots" ON parking_spots
  FOR INSERT WITH CHECK (true);

-- Policy: Anyone can update parking spots
CREATE POLICY "Anyone can update parking spots" ON parking_spots
  FOR UPDATE USING (true);

-- Policy: Anyone can read reports
CREATE POLICY "Anyone can read reports" ON reports
  FOR SELECT USING (true);

-- Policy: Anyone can insert reports
CREATE POLICY "Anyone can insert reports" ON reports
  FOR INSERT WITH CHECK (true);

-- Policy: Anyone can read users (nur öffentliche Daten)
CREATE POLICY "Anyone can read users" ON users
  FOR SELECT USING (true);

-- Function to calculate points earned
CREATE OR REPLACE FUNCTION calculate_points(spot_age_hours NUMERIC)
RETURNS INTEGER AS $$
BEGIN
  -- Ältere Reports geben mehr Punkte (bis zu 50)
  IF spot_age_hours > 24 THEN
    RETURN 50;
  ELSIF spot_age_hours > 12 THEN
    RETURN 30;
  ELSIF spot_age_hours > 6 THEN
    RETURN 20;
  ELSE
    RETURN 10;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update user points and level
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user points if user_id is provided
  IF NEW.user_id IS NOT NULL THEN
    UPDATE users
    SET points = points + NEW.points_earned,
        level = FLOOR((points + NEW.points_earned) / 100) + 1
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user points when report is created
CREATE TRIGGER update_user_points_on_report
  AFTER INSERT ON reports
  FOR EACH ROW EXECUTE FUNCTION update_user_points();

-- Demo Daten (optional)
-- INSERT INTO parking_spots (latitude, longitude, status) VALUES
--   (47.3769, 8.5417, 'free'),
--   (47.3779, 8.5427, 'occupied'),
--   (47.3759, 8.5407, 'free');

