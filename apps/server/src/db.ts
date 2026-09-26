import { sql } from 'postgres';
import pg from 'postgres';

const databaseUrl = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/solve_ai';

const client = pg(databaseUrl);

export const db = client;

export async function initDatabase() {
  try {
    await db`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255),
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'user',
        plan VARCHAR(50) DEFAULT 'Starter',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        type VARCHAR(50),
        balance DECIMAL(10, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        description TEXT,
        due_date DATE,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        plan VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        billing_cycle VARCHAR(50),
        stripe_subscription_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ends_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type VARCHAR(50),
        amount DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50),
        description TEXT,
        reference_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        data JSONB,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export async function closeDatabase() {
  await db.end();
}
