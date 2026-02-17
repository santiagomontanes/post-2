import type Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

export const runMigrations = (db: Database.Database): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role in ('ADMIN','SELLER')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      cpu TEXT NOT NULL,
      ram_gb INTEGER NOT NULL,
      storage TEXT NOT NULL,
      condition TEXT NOT NULL,
      purchase_price INTEGER NOT NULL,
      sale_price INTEGER NOT NULL,
      stock INTEGER NOT NULL,
      notes TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      invoice_number TEXT NOT NULL UNIQUE,
      date TEXT NOT NULL,
      user_id TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      discount INTEGER NOT NULL,
      total INTEGER NOT NULL,
      customer_name TEXT,
      customer_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL,
      product_id TEXT,
      qty INTEGER NOT NULL,
      unit_price INTEGER NOT NULL,
      line_total INTEGER NOT NULL,
      description TEXT DEFAULT '',
      FOREIGN KEY (sale_id) REFERENCES sales(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      concept TEXT NOT NULL,
      amount INTEGER NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cash_closures (
      id TEXT PRIMARY KEY,
      opened_at TEXT NOT NULL,
      closed_at TEXT,
      opened_by TEXT NOT NULL,
      opening_notes TEXT,
      closed_by TEXT,
      opening_cash INTEGER NOT NULL,
      expected_cash INTEGER,
      counted_cash INTEGER,
      total_sales INTEGER,
      total_expenses INTEGER,
      difference INTEGER,
      notes TEXT
    );
  `);

  const productCols = db.prepare('PRAGMA table_info(products)').all() as Array<{ name: string }>;
  if (!productCols.some((c) => c.name === 'active')) {
    db.exec('ALTER TABLE products ADD COLUMN active INTEGER NOT NULL DEFAULT 1');
  }




  const saleItemCols = db.prepare('PRAGMA table_info(sale_items)').all() as Array<{ name: string; notnull: number }>;
  const hasDescription = saleItemCols.some((c) => c.name === 'description');
  const productIdCol = saleItemCols.find((c) => c.name === 'product_id');
  const needsNullableProductId = productIdCol?.notnull === 1;

  if (needsNullableProductId) {
    db.exec(`
      ALTER TABLE sale_items RENAME TO sale_items_old;
      CREATE TABLE sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT NOT NULL,
        product_id TEXT,
        qty INTEGER NOT NULL,
        unit_price INTEGER NOT NULL,
        line_total INTEGER NOT NULL,
        description TEXT DEFAULT '',
        FOREIGN KEY (sale_id) REFERENCES sales(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
      INSERT INTO sale_items (id,sale_id,product_id,qty,unit_price,line_total,description)
      SELECT id,sale_id,product_id,qty,unit_price,line_total,'' FROM sale_items_old;
      DROP TABLE sale_items_old;
    `);
  } else if (!hasDescription) {
    db.exec("ALTER TABLE sale_items ADD COLUMN description TEXT DEFAULT ''");
  }

  const cashCols = db.prepare('PRAGMA table_info(cash_closures)').all() as Array<{ name: string }>;
  if (!cashCols.some((c) => c.name === 'opening_notes')) {
    db.exec('ALTER TABLE cash_closures ADD COLUMN opening_notes TEXT');
  }
  if (!cashCols.some((c) => c.name === 'difference')) {
    db.exec('ALTER TABLE cash_closures ADD COLUMN difference INTEGER');
  }
};

export const seedDefaultAdmin = (db: Database.Database): void => {
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@sistetecni.com') as { id: string } | undefined;
  if (exists) return;
  const now = new Date().toISOString();
  const hash = bcrypt.hashSync('Admin123*', 10);
  db.prepare('INSERT INTO users (id,name,email,password_hash,role,created_at) VALUES (?,?,?,?,?,?)').run(
    uuid(),
    'Administrador',
    'admin@sistetecni.com',
    hash,
    'ADMIN',
    now,
  );
};
