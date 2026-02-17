import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import { getDb } from './db';

export type Role = 'ADMIN' | 'SELLER';

export const authUser = (email: string, password: string): { id: string; name: string; role: Role; email: string } | null => {
  const row = getDb().prepare('SELECT id,name,email,password_hash,role FROM users WHERE email = ?').get(email) as
    | { id: string; name: string; email: string; password_hash: string; role: Role }
    | undefined;
  if (!row || !bcrypt.compareSync(password, row.password_hash)) return null;
  return { id: row.id, name: row.name, role: row.role, email: row.email };
};

export const listProducts = (search = ''): unknown[] => {
  const q = `%${search}%`;
  return getDb()
    .prepare('SELECT * FROM products WHERE active = 1 AND (brand LIKE ? OR model LIKE ? OR cpu LIKE ?) ORDER BY created_at DESC')
    .all(q, q, q);
};

export const upsertProduct = (payload: any): string => {
  const now = new Date().toISOString();
  const id = payload.id ?? uuid();
  const existing = getDb().prepare('SELECT id FROM products WHERE id = ?').get(id);
  if (existing) {
    updateProduct({ ...payload, id });
  } else {
    getDb()
      .prepare(
        `INSERT INTO products (id,brand,model,cpu,ram_gb,storage,condition,purchase_price,sale_price,stock,notes,active,created_at,updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        id,
        payload.brand,
        payload.model,
        payload.cpu,
        payload.ram_gb,
        payload.storage,
        payload.condition,
        payload.purchase_price,
        payload.sale_price,
        payload.stock,
        payload.notes ?? '',
        1,
        now,
        now,
      );
  }
  return id;
};

export const updateProduct = (payload: any): void => {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `UPDATE products SET brand=?,model=?,cpu=?,ram_gb=?,storage=?,condition=?,purchase_price=?,sale_price=?,stock=?,notes=?,updated_at=? WHERE id=?`,
    )
    .run(
      payload.brand,
      payload.model,
      payload.cpu,
      payload.ram_gb,
      payload.storage,
      payload.condition,
      payload.purchase_price,
      payload.sale_price,
      payload.stock,
      payload.notes ?? '',
      now,
      payload.id,
    );
};

export const archiveProduct = (id: string): void => {
  getDb().prepare('UPDATE products SET active = 0, updated_at = ? WHERE id = ?').run(new Date().toISOString(), id);
};

export const nextInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const pref = `ST-${year}-`;
  const row = getDb()
    .prepare('SELECT invoice_number FROM sales WHERE invoice_number LIKE ? ORDER BY invoice_number DESC LIMIT 1')
    .get(`${pref}%`) as { invoice_number?: string } | undefined;
  const n = row?.invoice_number ? Number(row.invoice_number.split('-')[2]) + 1 : 1;
  return `${pref}${String(n).padStart(6, '0')}`;
};

export const createSale = (input: any): { saleId: string; invoiceNumber: string } => {
  const db = getDb();
  const saleId = uuid();
  const invoiceNumber = nextInvoiceNumber();
  const now = new Date().toISOString();

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO sales (id,invoice_number,date,user_id,payment_method,subtotal,discount,total,customer_name,customer_id,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    ).run(
      saleId,
      invoiceNumber,
      now,
      input.userId,
      input.paymentMethod,
      input.subtotal,
      input.discount,
      input.total,
      input.customerName ?? '',
      input.customerId ?? '',
      now,
    );

    for (const item of input.items) {
      const product = db.prepare('SELECT stock FROM products WHERE id=?').get(item.product_id) as { stock: number } | undefined;
      if (!product || item.qty > product.stock) {
        throw new Error('Stock insuficiente para uno de los productos.');
      }
      db.prepare('INSERT INTO sale_items (id,sale_id,product_id,qty,unit_price,line_total) VALUES (?,?,?,?,?,?)').run(
        uuid(),
        saleId,
        item.product_id,
        item.qty,
        item.unit_price,
        item.line_total,
      );
      db.prepare('UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ?').run(item.qty, now, item.product_id);
    }
  });

  tx();
  return { saleId, invoiceNumber };
};

export const addExpense = (data: any): string => {
  const id = uuid();
  const now = new Date().toISOString();
  getDb().prepare('INSERT INTO expenses (id,date,concept,amount,notes,created_at) VALUES (?,?,?,?,?,?)').run(
    id,
    data.date,
    data.concept,
    data.amount,
    data.notes ?? '',
    now,
  );
  return id;
};

export const listExpenses = (from: string, to: string): unknown[] =>
  getDb().prepare('SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC').all(from, to);

export const getLastCashClosure = (): unknown =>
  getDb().prepare('SELECT * FROM cash_closures WHERE closed_at IS NOT NULL ORDER BY closed_at DESC LIMIT 1').get();

export const getOpenSuggestion = (): unknown => {
  const last = getLastCashClosure() as any;
  if (!last) return { suggestedOpeningCash: null, lastClosedAt: null };
  return {
    suggestedOpeningCash: last.counted_cash ?? null,
    lastClosedAt: last.closed_at ?? null,
  };
};

export const openCash = (data: { userId: string; openingCash: number; openingNotes?: string }): string => {
  const id = uuid();
  getDb().prepare('INSERT INTO cash_closures (id,opened_at,opened_by,opening_cash,opening_notes) VALUES (?,?,?,?,?)').run(
    id,
    new Date().toISOString(),
    data.userId,
    data.openingCash,
    data.openingNotes ?? '',
  );
  return id;
};

export const getOpenCash = (): unknown =>
  getDb().prepare('SELECT * FROM cash_closures WHERE closed_at IS NULL ORDER BY opened_at DESC LIMIT 1').get();


export const getCashStatus = (): unknown => {
  const db = getDb();
  const open = db.prepare('SELECT * FROM cash_closures WHERE closed_at IS NULL ORDER BY opened_at DESC LIMIT 1').get() as any;
  if (!open) return null;

  const now = new Date().toISOString();
  const cashSales = (db
    .prepare('SELECT COALESCE(SUM(total),0) as total FROM sales WHERE date BETWEEN ? AND ? AND payment_method = ?')
    .get(open.opened_at, now, 'EFECTIVO') as any).total;
  const expenses = (db.prepare('SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE date BETWEEN ? AND ?').get(open.opened_at, now) as any).total;
  const expectedCash = open.opening_cash + cashSales - expenses;

  return {
    openedAt: open.opened_at,
    openingCash: open.opening_cash,
    cashSales,
    expenses,
    expectedCash,
  };
};

export const closeCash = (data: { id: string; countedCash: number; userId: string; notes: string }): unknown => {
  const db = getDb();
  const cash = db.prepare('SELECT * FROM cash_closures WHERE id = ?').get(data.id) as any;
  const closedAt = new Date().toISOString();
  const sales = (db
    .prepare(
      'SELECT COALESCE(SUM(total),0) as total, COALESCE(SUM(CASE WHEN payment_method = ? THEN total ELSE 0 END),0) as cashSales FROM sales WHERE date BETWEEN ? AND ?',
    )
    .get('EFECTIVO', cash.opened_at, closedAt) as any);
  const expenses = (db.prepare('SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE date BETWEEN ? AND ?').get(cash.opened_at, closedAt) as any)
    .total;
  const expectedCash = cash.opening_cash + sales.cashSales - expenses;
  const diff = data.countedCash - expectedCash;
  db.prepare(
    'UPDATE cash_closures SET closed_at=?,closed_by=?,counted_cash=?,expected_cash=?,total_sales=?,total_expenses=?,difference=?,notes=? WHERE id=?',
  ).run(closedAt, data.userId, data.countedCash, expectedCash, sales.total, expenses, diff, data.notes, data.id);
  return { closedAt, expectedCash, totalSales: sales.total, totalExpenses: expenses, diff };
};

export const getTodaySummary = (): unknown => {
  const db = getDb();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

  return db
    .prepare(
      `SELECT
        (SELECT COALESCE(SUM(total),0) FROM sales WHERE date BETWEEN ? AND ?) as total_sales,
        (SELECT COALESCE(SUM(total),0) FROM sales WHERE date BETWEEN ? AND ? AND payment_method = ?) as cash_sales,
        (SELECT COALESCE(SUM(amount),0) FROM expenses WHERE date BETWEEN ? AND ?) as total_expenses,
        (SELECT COALESCE(SUM(si.qty * p.purchase_price),0)
          FROM sale_items si
          JOIN sales s ON s.id = si.sale_id
          JOIN products p ON p.id = si.product_id
          WHERE s.date BETWEEN ? AND ?) as total_costs`,
    )
    .get(start, end, start, end, 'EFECTIVO', start, end, start, end);
};

export const getLast7DaysSales = (): unknown[] => {
  const now = new Date();
  const from = new Date(now);
  from.setDate(now.getDate() - 6);
  from.setHours(0, 0, 0, 0);
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  return getDb()
    .prepare('SELECT substr(date,1,10) as day, COALESCE(SUM(total),0) as total FROM sales WHERE date BETWEEN ? AND ? GROUP BY day ORDER BY day')
    .all(from.toISOString(), to.toISOString());
};

export const reportSalesByDay = (from: string, to: string): unknown[] =>
  getDb().prepare('SELECT substr(date,1,10) as day, SUM(total) as total FROM sales WHERE date BETWEEN ? AND ? GROUP BY day ORDER BY day').all(from, to);

export const reportTopProducts = (from: string, to: string): unknown[] =>
  getDb()
    .prepare(
      `SELECT p.brand || ' ' || p.model as name, SUM(si.qty) as qty
       FROM sale_items si
       JOIN sales s ON s.id = si.sale_id
       JOIN products p ON p.id = si.product_id
       WHERE s.date BETWEEN ? AND ?
       GROUP BY si.product_id
       ORDER BY qty DESC LIMIT 10`,
    )
    .all(from, to);

export const reportSummary = (from: string, to: string): unknown =>
  getDb()
    .prepare(
      `SELECT
        (SELECT COALESCE(SUM(total),0) FROM sales WHERE date BETWEEN ? AND ?) as total_sales,
        (SELECT COALESCE(SUM(amount),0) FROM expenses WHERE date BETWEEN ? AND ?) as total_expenses,
        (SELECT COALESCE(SUM(si.qty * p.purchase_price),0)
          FROM sale_items si
          JOIN sales s ON s.id = si.sale_id
          JOIN products p ON p.id = si.product_id
          WHERE s.date BETWEEN ? AND ?) as total_costs`,
    )
    .get(from, to, from, to, from, to);
