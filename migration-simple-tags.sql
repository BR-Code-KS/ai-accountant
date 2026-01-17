-- Migration: Simplify tags to be account/transaction-specific
-- This removes the centralized tag system and makes tags simple text arrays

-- Add tag columns to accounts and transactions
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Drop the old tag system (junction tables and tags table)
DROP TABLE IF EXISTS account_tags CASCADE;
DROP TABLE IF EXISTS transaction_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- Note: Run this migration in your Supabase SQL Editor
