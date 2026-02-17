import { useEffect, useState } from 'react';
import { deleteProduct, listProducts, saveProduct, updateProduct } from '../services/products';
import { Modal } from '../ui/Modal';

const base = { brand:'',model:'',cpu:'',ram_gb:8,storage:'256GB',condition:'Usado',purchase_price:0,sale_price:0,stock:1,notes:'' };
const numericKeys = ['ram_gb', 'purchase_price', 'sale_price', 'stock'];

export const Inventory = ({ role }: { role: string }) => {
  const [items,setItems]=useState<any[]>([]);
  const [q,setQ]=useState('');
  const [form,setForm]=useState<any>(base);
  const [editing,setEditing]=useState<any | null>(null);
  const [editForm,setEditForm]=useState<any>(base);

  const load = async () => setItems(await listProducts(q));
  useEffect(()=>{ void load(); },[q]);

  const isInvalid = (data: any) => data.ram_gb < 0 || data.stock < 0 || data.purchase_price < 0 || data.sale_price < 0;

  return <div>
    <div className="card grid grid-2">
      {Object.keys(base).map((k)=><input key={k} placeholder={k} value={form[k]} onChange={(e)=>setForm({...form,[k]:numericKeys.includes(k)?Number(e.target.value):e.target.value})} />)}
      <button
        onClick={async()=>{
          if (isInvalid(form)) return alert('Valores inválidos: ram_gb, stock y precios no pueden ser negativos.');
          await saveProduct(form);
          setForm(base);
          await load();
        }}
      >Guardar</button>
    </div>
    <div className="card">
      <input placeholder="Buscar" value={q} onChange={(e)=>setQ(e.target.value)} />
      <table>
        <thead><tr><th>Equipo</th><th>Precio</th><th>Stock</th><th></th></tr></thead>
        <tbody>
          {items.map((p:any)=><tr key={p.id}>
            <td>{p.brand} {p.model} {p.cpu}</td>
            <td>{p.sale_price}</td>
            <td className={p.stock<=1?'low-stock':''}>{p.stock}</td>
            <td>
              <button onClick={()=>{ setEditing(p); setEditForm({ ...p }); }}>Editar</button>
              {role==='ADMIN'&&<button onClick={async()=>{await deleteProduct(p.id);await load();}}>Eliminar</button>}
            </td>
          </tr>)}</tbody>
      </table>
    </div>

    <Modal open={Boolean(editing)}>
      <h3>Editar producto</h3>
      <div className="grid grid-2">
        {Object.keys(base).map((k)=><input key={k} placeholder={k} value={editForm[k] ?? ''} onChange={(e)=>setEditForm({...editForm,[k]:numericKeys.includes(k)?Number(e.target.value):e.target.value})} />)}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          onClick={async()=>{
            if (isInvalid(editForm)) return alert('Valores inválidos: ram_gb, stock y precios no pueden ser negativos.');
            await updateProduct(editForm);
            setEditing(null);
            await load();
          }}
        >Guardar cambios</button>
        <button onClick={()=>setEditing(null)}>Cancelar</button>
      </div>
    </Modal>
  </div>;
};
