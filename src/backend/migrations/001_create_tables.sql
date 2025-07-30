-- SQLite migration script for Access Code Galaxy
-- This script creates the profiles and challenge_progress tables for use with SQLite.

-- Create a profiles table for additional user information
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  accessibility_mode TEXT,
  xp_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create a table for challenge progress
CREATE TABLE IF NOT EXISTS challenge_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, challenge_id),
  FOREIGN KEY(user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_id ON challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge_id ON challenge_progress(challenge_id);
