const user = `CREATE TABLE IF NOT EXISTS "users" (
id SERIAL PRIMARY KEY,
username VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL UNIQUE,
password TEXT,
oauth_provider VARCHAR(255),
oauth_id TEXT,
avatar TEXT NOT NULL,
created_at TIMESTAMP DEFAULT NOW())`;

export default user;
