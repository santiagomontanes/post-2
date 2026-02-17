import { useEffect, useState } from 'react';
import { deleteProduct, listProducts, saveProduct } from '../services/products';

const base = { brand:'',model:'',cpu:'',ram_gb:8,storage:'256GB',condition:'Usado',purchase_price:0,sale_price:0,stock:1,notes:'' };
export const Inventory = ({ role }: { role: string }) => {
  const [items,setItems]=useState<any[]>([]); const [q,setQ]=useState(''); const [form,setForm]=useState<any>(base);
  const load = async () => setItems(await listProducts(q));
  useEffect(()=>{ void load(); },[q]);
  return <div>
    <div className="card grid grid-2">
      {Object.keys(base).map((k)=><input key={k} placeholder={k} value={form[k]} onChange={(e)=>setForm({...form,[k]:['ram_gb','purchase_price','sale_price','stock'].includes(k)?Number(e.target.value):e.target.value})} />)}
      <button onClick={async()=>{await saveProduct(form);setForm(base);await load();}}>Guardar</button>
    </div>
    <div className="card"><input placeholder="Buscar" value={q} onChange={(e)=>setQ(e.target.value)} /><table><thead><tr><th>Equipo</th><th>Precio</th><th>Stock</th><th></th></tr></thead><tbody>{items.map((p:any)=><tr key={p.id}><td>{p.brand} {p.model} {p.cpu}</td><td>{p.sale_price}</td><td className={p.stock<=1?'low-stock':''}>{p.stock}</td><td>{role==='ADMIN'&&<button onClick={async()=>{await deleteProduct(p.id);await load();}}>Eliminar</button>}</td></tr>)}</tbody></table></div>
  </div>;
};
