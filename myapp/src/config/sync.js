/*
 * File created to create the application's database tables
 */

import { pool } from "./db.js";

const user = `CREATE TABLE IF NOT EXISTS "users" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password TEXT,
  oauth_provider VARCHAR(255),
  oauth_id TEXT,
  avatar TEXT NOT NULL,
  reset_password_token TEXT,
  reset_password_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW())`;

const refreshTokens = `CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE)`;

const list = `CREATE TABLE IF NOT EXISTS "lists" (
  id SERIAL PRIMARY KEY ,
  name_list VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  is_protected BOOLEAN DEFAULT FALSE)`;

const task = `CREATE TABLE IF NOT EXISTS "tasks" (
  id SERIAL PRIMARY KEY,
  name_task VARCHAR(100) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMP DEFAULT NULL,
  comment TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  list_id INTEGER NOT NULL,
  FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE)`;

const execute = async () => {
  try {
    await pool.query(user);
    await pool.query(list);
    await pool.query(task);
    await pool.query(refreshTokens);
  } catch (err) {
    console.error("Error creating tables:", err.stack);
    throw new Error("Error creating tables:", err.stack);
  }
};

export default execute;
