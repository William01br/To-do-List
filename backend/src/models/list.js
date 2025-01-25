const list = `CREATE TABLE IF NOT EXISTS "lists" (
id SERIAL PRIMARY KEY ,
name_list VARCHAR(100) NOT NULL,
created_at TIMESTAMP DEFAULT NOW(),
user_id INTEGER NOT NULL,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
is_protected BOOLEAN DEFAULT FALSE)`;

export default list;
