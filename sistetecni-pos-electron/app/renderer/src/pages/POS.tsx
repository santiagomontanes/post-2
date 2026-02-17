import { useEffect, useMemo, useState } from 'react';
import { listProducts } from '../services/products';
import { createSale, printInvoice } from '../services/sales';

type CartItem = {
  product_id: string;
  name: string;
  qty: number;
  unit_price: number;
  line_total: number;
  stock: number;
};

export const POS = ({ user }: { user: any }) => {
  const [q, setQ] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPayment] = useState('EFECTIVO');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    void listProducts(q).then(setProducts);
  }, [q]);

  const subtotal = useMemo(() => cart.reduce((a, c) => a + c.line_total, 0), [cart]);
  const total = subtotal - discount;

  const setQty = (productId: string, qty: number): void => {
    setCart((current) =>
      current.map((item) => {
        if (item.product_id !== productId) return item;
        const safeQty = Math.max(1, Math.min(qty, item.stock));
        if (qty > item.stock) setMessage(`Stock insuficiente para ${item.name}. Máximo disponible: ${item.stock}.`);
        return { ...item, qty: safeQty, line_total: safeQty * item.unit_price };
      }),
    );
  };

  const add = (p: any): void => {
    setMessage('');
    setCart((current) => {
      const found = current.find((x) => x.product_id === p.id);
      if (found) {
        if (found.qty + 1 > p.stock) {
          setMessage(`No puedes agregar más de ${p.stock} unidades de ${p.brand} ${p.model}.`);
          return current;
        }
        return current.map((x) =>
          x.product_id === p.id ? { ...x, qty: x.qty + 1, line_total: (x.qty + 1) * x.unit_price } : x,
        );
      }
      return [
        ...current,
        { product_id: p.id, name: `${p.brand} ${p.model}`, qty: 1, unit_price: p.sale_price, line_total: p.sale_price, stock: p.stock },
      ];
    });
  };

  const removeItem = (productId: string): void => {
    setCart((current) => current.filter((i) => i.product_id !== productId));
  };

  const clearCart = (): void => {
    setCart([]);
    setDiscount(0);
    setMessage('');
  };

  const confirm = async (): Promise<void> => {
    if (isProcessing) return;
    if (cart.length === 0) return setMessage('El carrito está vacío.');

    setIsProcessing(true);
    setMessage('');
    try {
      const res = await createSale({
        userId: user.id,
        items: cart,
        subtotal,
        discount,
        total,
        paymentMethod,
        customerName: '',
        customerId: '',
      });
      const html = `<h1>Factura ${res.invoiceNumber}</h1><p>Total: ${total}</p>`;
      await printInvoice(html);
      alert(`Venta registrada. PDF: ${res.pdf}`);
      clearCart();
    } catch (e: any) {
      setMessage(e?.message || 'No se pudo confirmar la venta.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="card">
        <input placeholder="Buscar producto" value={q} onChange={(e) => setQ(e.target.value)} />
        {products.map((p: any) => (
          <button key={p.id} onClick={() => add(p)}>
            {p.brand} {p.model} ({p.stock})
          </button>
        ))}
      </div>

      <div className="card">
        <h3>Carrito</h3>
        {cart.map((i) => (
          <div key={i.product_id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ minWidth: 220 }}>{i.name}</span>
            <button onClick={() => setQty(i.product_id, i.qty - 1)}>-</button>
            <input type="number" min={1} max={i.stock} value={i.qty} onChange={(e) => setQty(i.product_id, Number(e.target.value || 1))} />
            <button onClick={() => setQty(i.product_id, i.qty + 1)}>+</button>
            <span>= {i.line_total}</span>
            <button onClick={() => removeItem(i.product_id)}>Eliminar</button>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button onClick={clearCart}>Vaciar carrito</button>
          <button onClick={clearCart}>Cancelar venta</button>
        </div>

        <input type="number" value={discount} onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))} placeholder="Descuento" />
        <select value={paymentMethod} onChange={(e) => setPayment(e.target.value)}>
          <option>EFECTIVO</option>
          <option>TRANSFERENCIA</option>
          <option>TARJETA</option>
          <option>ADDI</option>
          <option>OTRO</option>
        </select>
        {message && <p style={{ color: '#b00020' }}>{message}</p>}
        <h2>Total {total}</h2>
        <button onClick={confirm} disabled={isProcessing}>{isProcessing ? 'Procesando...' : 'Confirmar venta'}</button>
      </div>
    </div>
  );
};
