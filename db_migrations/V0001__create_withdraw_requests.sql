CREATE TABLE withdraw_requests (
  id SERIAL PRIMARY KEY,
  nickname TEXT NOT NULL,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);