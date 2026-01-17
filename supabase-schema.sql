-- AI Accountant Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tags table
CREATE TABLE tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts table
CREATE TABLE accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('asset', 'income', 'expense')),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  balance DECIMAL(15, 2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'transfer', 'expense')),
  amount DECIMAL(15, 2) NOT NULL,
  from_account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  to_account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Account tags junction table
CREATE TABLE account_tags (
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (account_id, tag_id)
);

-- Transaction tags junction table
CREATE TABLE transaction_tags (
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (transaction_id, tag_id)
);

-- Function to update account balance
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- For new transactions
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'deposit' THEN
      UPDATE accounts SET balance = balance + NEW.amount, updated_at = NOW()
      WHERE id = NEW.to_account_id;
    ELSIF NEW.type = 'transfer' THEN
      UPDATE accounts SET balance = balance - NEW.amount, updated_at = NOW()
      WHERE id = NEW.from_account_id;
      UPDATE accounts SET balance = balance + NEW.amount, updated_at = NOW()
      WHERE id = NEW.to_account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE accounts SET balance = balance - NEW.amount, updated_at = NOW()
      WHERE id = NEW.from_account_id;
    END IF;
  -- For deleted transactions (reverse the operation)
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'deposit' THEN
      UPDATE accounts SET balance = balance - OLD.amount, updated_at = NOW()
      WHERE id = OLD.to_account_id;
    ELSIF OLD.type = 'transfer' THEN
      UPDATE accounts SET balance = balance + OLD.amount, updated_at = NOW()
      WHERE id = OLD.from_account_id;
      UPDATE accounts SET balance = balance - OLD.amount, updated_at = NOW()
      WHERE id = OLD.to_account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE accounts SET balance = balance + OLD.amount, updated_at = NOW()
      WHERE id = OLD.from_account_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update account balances
CREATE TRIGGER transaction_balance_trigger
AFTER INSERT OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance();

-- Indexes for better performance
CREATE INDEX idx_transactions_from_account ON transactions(from_account_id);
CREATE INDEX idx_transactions_to_account ON transactions(to_account_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_accounts_type ON accounts(type);

-- Enable Row Level Security (RLS) - Optional, configure based on your auth needs
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_tags ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on tags" ON tags FOR ALL USING (true);
CREATE POLICY "Allow all operations on accounts" ON accounts FOR ALL USING (true);
CREATE POLICY "Allow all operations on transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on account_tags" ON account_tags FOR ALL USING (true);
CREATE POLICY "Allow all operations on transaction_tags" ON transaction_tags FOR ALL USING (true);
