const user = `CREATE TABLE IF NOT EXISTS "users" (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL,
username VARCHAR(100) NOT NULL UNIQUE,
email VARCHAR(100) NOT NULL UNIQUE,
password TEXT,
oauthProvider VARCHAR(255),
ouathId TEXT,
avatar TEXT NOT NULL,
createdAt TIMESTAMP DEFAULT NOW())`;

export default user;
