import { useEffect, useMemo, useState } from 'react';
import { listPosProducts } from '../services/products';
import { createSale, printInvoice } from '../services/sales';
import { Modal } from '../ui/Modal';

type CartItem = {
  cart_id: string;
  product_id: string | null;
  description?: string;
  name: string;
  qty: number;
  unit_price: number;
  line_total: number;
  stock: number | null;
  unit_cost: number;
};

export const POS = ({ user }: { user: any }) => {
  const [q, setQ] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPayment] = useState('EFECTIVO');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [freeOpen, setFreeOpen] = useState(false);
  const [freeDescription, setFreeDescription] = useState('');
  const [freePrice, setFreePrice] = useState(0);
  const [freeCost, setFreeCost] = useState(0);
  const [freeQty, setFreeQty] = useState(1);

  useEffect(() => {
    void listPosProducts(q).then(setProducts);
  }, [q]);

  const subtotal = useMemo(() => cart.reduce((a, c) => a + c.line_total, 0), [cart]);
  const total = subtotal - discount;

  const setQty = (cartId: string, qty: number): void => {
    setCart((current) =>
      current.map((item) => {
        if (item.cart_id !== cartId) return item;
        if (item.stock == null) {
          const safeQty = Math.max(1, qty);
          return { ...item, qty: safeQty, line_total: safeQty * item.unit_price };
        }
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
        if ((found.stock ?? 0) > 0 && found.qty + 1 > (found.stock ?? 0)) {
          setMessage(`No puedes agregar más de ${p.stock} unidades de ${p.brand} ${p.model}.`);
          return current;
        }
        return current.map((x) =>
          x.product_id === p.id ? { ...x, qty: x.qty + 1, line_total: (x.qty + 1) * x.unit_price } : x,
        );
      }
      return [
        ...current,
        {
          cart_id: `${p.id}-${Date.now()}`,
          product_id: p.id,
          name: `${p.brand} ${p.model}`,
          qty: 1,
          unit_price: p.sale_price,
          line_total: p.sale_price,
          stock: p.stock,
          unit_cost: 0,
        },
      ];
    });
  };

  const addFreeItem = (): void => {
    const description = freeDescription.trim();
    if (!description) return setMessage('La descripción del ítem libre es obligatoria.');
    if (freePrice < 0) return setMessage('El precio unitario no puede ser negativo.');
    if (freeQty < 1) return setMessage('La cantidad debe ser mínimo 1.');
    if (freeCost < 0) return setMessage('El costo unitario no puede ser negativo.');

    const id = `free-${Date.now()}`;
    setCart((current) => [
      ...current,
      {
        cart_id: id,
        product_id: null,
        description,
        name: description,
        qty: freeQty,
        unit_price: freePrice,
        line_total: freeQty * freePrice,
        stock: null,
        unit_cost: freeCost,
      },
    ]);

    setFreeDescription('');
    setFreePrice(0);
    setFreeCost(0);
    setFreeQty(1);
    setFreeOpen(false);
    setMessage('');
  };

  const removeItem = (cartId: string): void => {
    setCart((current) => current.filter((i) => i.cart_id !== cartId));
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
      const saleItems = cart.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        description: item.product_id ? '' : item.description ?? item.name,
        qty: item.qty,
        unit_price: item.unit_price,
        line_total: item.line_total,
        unit_cost: item.unit_cost,
      }));

      const res = await createSale({
        userId: user.id,
        items: saleItems,
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
        <button onClick={() => setFreeOpen(true)}>Agregar ítem libre</button>
        {products.map((p: any) => (
          <button key={p.id} onClick={() => add(p)}>
            {p.brand} {p.model} ({p.stock})
          </button>
        ))}
      </div>

      <div className="card">
        <h3>Carrito</h3>
        {cart.map((i) => (
          <div key={i.cart_id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ minWidth: 220 }}>{i.name}</span>
            <button onClick={() => setQty(i.cart_id, i.qty - 1)}>-</button>
            <input
              type="number"
              min={1}
              max={i.stock ?? undefined}
              value={i.qty}
              onChange={(e) => setQty(i.cart_id, Number(e.target.value || 1))}
            />
            <button onClick={() => setQty(i.cart_id, i.qty + 1)}>+</button>
            <span>= {i.line_total}</span>
            <button onClick={() => removeItem(i.cart_id)}>Eliminar</button>
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

      <Modal open={freeOpen} onClose={() => setFreeOpen(false)}>
        <h3>Agregar ítem libre</h3>
        <label>
          Descripción
          <input value={freeDescription} onChange={(e) => setFreeDescription(e.target.value)} placeholder="Servicio formateo" />
        </label>
        <label>
          Precio unitario
          <input type="number" min={0} value={freePrice} onChange={(e) => setFreePrice(Math.max(0, Number(e.target.value || 0)))} />
        </label>
        <label>
          Costo unitario (opcional)
          <input type="number" min={0} value={freeCost} onChange={(e) => setFreeCost(Math.max(0, Number(e.target.value || 0)))} />
        </label>
        <label>
          Cantidad
          <input type="number" min={1} value={freeQty} onChange={(e) => setFreeQty(Math.max(1, Number(e.target.value || 1)))} />
        </label>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button onClick={addFreeItem}>Agregar</button>
          <button onClick={() => setFreeOpen(false)}>Cancelar</button>
        </div>
      </Modal>
    </div>
  );
};
