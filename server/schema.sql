
-- Create database
CREATE DATABASE IF NOT EXISTS booking_app;
USE booking_app;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  avatar VARCHAR(255),
  bio TEXT,
  phone VARCHAR(50),
  team_id VARCHAR(36),
  is_team_leader BOOLEAN DEFAULT FALSE
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  leader_id VARCHAR(36),
  color VARCHAR(50),
  FOREIGN KEY (leader_id) REFERENCES profiles(id) ON DELETE SET NULL
);

-- Add foreign key from profiles to teams
ALTER TABLE profiles
ADD CONSTRAINT fk_profile_team
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- Floor maps table
CREATE TABLE IF NOT EXISTS floor_maps (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  width INT NOT NULL,
  height INT NOT NULL,
  background TEXT
);

-- Resources (desks and meeting rooms) table
CREATE TABLE IF NOT EXISTS resources (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  x DOUBLE NOT NULL,
  y DOUBLE NOT NULL,
  width DOUBLE NOT NULL,
  height DOUBLE NOT NULL,
  status VARCHAR(50) NOT NULL,
  map_id VARCHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL,
  capacity INT,
  FOREIGN KEY (map_id) REFERENCES floor_maps(id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(36) PRIMARY KEY,
  resource_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_days JSON,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
