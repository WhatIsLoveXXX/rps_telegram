CREATE TABLE IF NOT EXISTS users (
                                     id BIGINT PRIMARY KEY,
                                     first_name TEXT DEFAULT '',
                                     last_name TEXT DEFAULT '',
                                     photo_url TEXT DEFAULT '',
                                     balance BIGINT DEFAULT 0,
                                     wallet VARCHAR DEFAULT NULL
);

CREATE TABLE rooms (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       created_at TIMESTAMP DEFAULT now(),
                       betAmount BIGINT NOT NULL
);

CREATE TABLE room_users (
                            room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
                            user_id BIGINT,
                            PRIMARY KEY (room_id, user_id)
);

CREATE TABLE transactions (
                              id SERIAL PRIMARY KEY,
                              user_id BIGINT NOT NULL,
                              amount BIGINT NOT NULL,
                              type smallint NOT NULL, -- 'withdrawal' / 'deposit'
                              tx_hash TEXT NOT NULL,
                              created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE pending_deposits (
                                  id SERIAL PRIMARY KEY,
                                  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                  boc TEXT NOT NULL,
                                  amount BIGINT NOT NULL,
                                  retry_count INTEGER DEFAULT 0,
                                  last_attempt_at TIMESTAMP DEFAULT NOW(),
                                  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE game_history (
                              id SERIAL PRIMARY KEY,
                              user_id BIGINT NOT NULL,
                              bet BIGINT NOT NULL,
                              result bit NOT NULL,
                              created_at TIMESTAMP DEFAULT now()
);
