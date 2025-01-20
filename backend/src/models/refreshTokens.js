const refreshTokens = `CREATE TABLE IF NOT EXISTS "refresh_tokens" (
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
refresh_token TEXT NOT NULL,
expires_at TIMESTAMP NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
revoked BOOLEAN DEFAULT FALSE)`;

export default refreshTokens;
