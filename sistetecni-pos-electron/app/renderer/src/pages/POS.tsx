import { useEffect, useMemo, useState } from 'react';
import { listProducts } from '../services/products';
import { createSale, printInvoice } from '../services/sales';

export const POS = ({ user }: { user: any }) => {
  const [q,setQ]=useState(''); const [products,setProducts]=useState<any[]>([]); const [cart,setCart]=useState<any[]>([]); const [discount,setDiscount]=useState(0); const [paymentMethod,setPayment]=useState('EFECTIVO');
  useEffect(()=>{ void listProducts(q).then(setProducts); },[q]);
  const subtotal = useMemo(()=>cart.reduce((a,c)=>a+c.line_total,0),[cart]); const total=subtotal-discount;
  const add = (p:any) => setCart((c)=>{ const f=c.find((x:any)=>x.product_id===p.id); if(f){ if(f.qty+1>p.stock) return c; return c.map((x:any)=>x.product_id===p.id?{...x,qty:x.qty+1,line_total:(x.qty+1)*x.unit_price}:x);} return [...c,{product_id:p.id,name:`${p.brand} ${p.model}`,qty:1,unit_price:p.sale_price,line_total:p.sale_price,stock:p.stock}]; });
  const confirm = async () => {
    const res = await createSale({ userId:user.id, items:cart, subtotal, discount, total, paymentMethod, customerName:'', customerId:'' });
    const html = `<h1>Factura ${res.invoiceNumber}</h1><p>Total: ${total}</p>`;
    await printInvoice(html);
    alert(`Venta registrada. PDF: ${res.pdf}`); setCart([]);
  };
  return <div><div className="card"><input placeholder="Buscar producto" value={q} onChange={(e)=>setQ(e.target.value)} /> {products.map((p:any)=><button key={p.id} onClick={()=>add(p)}>{p.brand} {p.model} ({p.stock})</button>)}</div>
  <div className="card"><h3>Carrito</h3>{cart.map((i:any)=><div key={i.product_id}>{i.name} x{i.qty} = {i.line_total}</div>)}<input type="number" value={discount} onChange={(e)=>setDiscount(Number(e.target.value))} placeholder="Descuento" /><select value={paymentMethod} onChange={(e)=>setPayment(e.target.value)}><option>EFECTIVO</option><option>TRANSFERENCIA</option><option>TARJETA</option><option>ADDI</option><option>OTRO</option></select><h2>Total {total}</h2><button onClick={confirm}>Confirmar venta</button></div></div>;
};
