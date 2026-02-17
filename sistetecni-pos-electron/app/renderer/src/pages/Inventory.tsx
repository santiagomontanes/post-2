import { useEffect, useRef, useState } from 'react';
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
  const [busy, setBusy] = useState(false);
  const loadId = useRef(0);

  const load = async (query = q): Promise<void> => {
    const id = ++loadId.current;
    try {
      const data = await listProducts(query);
      if (id === loadId.current) setItems(data);
    } catch (e: any) {
      if (id === loadId.current) alert(e?.message || 'No se pudo cargar inventario.');
    }
  };

  useEffect(()=>{ void load(q); },[q]);

  const isInvalid = (data: any) => data.ram_gb < 0 || data.stock < 0 || data.purchase_price < 0 || data.sale_price < 0;

  return <div>
    <div className="card grid grid-2">
      {Object.keys(base).map((k)=><input disabled={busy} key={k} placeholder={k} value={form[k]} onChange={(e)=>setForm({...form,[k]:numericKeys.includes(k)?Number(e.target.value):e.target.value})} />)}
      <button
        disabled={busy}
        onClick={async()=>{
          if (isInvalid(form)) return alert('Valores inválidos: ram_gb, stock y precios no pueden ser negativos.');
          setBusy(true);
          try {
            await saveProduct(form);
            setForm(base);
            await load(q);
          } catch (e: any) {
            alert(e?.message || 'No se pudo guardar el producto.');
          } finally {
            setBusy(false);
          }
        }}
      >Guardar</button>
    </div>
    <div className="card">
      <input disabled={busy} placeholder="Buscar" value={q} onChange={(e)=>setQ(e.target.value)} />
      <table>
        <thead><tr><th>Equipo</th><th>Precio</th><th>Stock</th><th></th></tr></thead>
        <tbody>
          {items.map((p:any)=><tr key={p.id}>
            <td>{p.brand} {p.model} {p.cpu}</td>
            <td>{p.sale_price}</td>
            <td className={p.stock<=1?'low-stock':''}>{p.stock}</td>
            <td>
              <button disabled={busy} onClick={()=>{ setEditing(p); setEditForm({ ...p }); }}>Editar</button>
              {role==='ADMIN'&&<button disabled={busy} onClick={async()=>{
                const prevItems = items;
                setItems(prevItems.filter((x:any)=>x.id!==p.id));
                setBusy(true);
                try {
                  await deleteProduct(p.id);
                  await load(q);
                } catch (e: any) {
                  setItems(prevItems);
                  alert(e?.message || 'No se pudo eliminar el producto.');
                } finally {
                  setBusy(false);
                }
              }}>Eliminar</button>}
            </td>
          </tr>)}</tbody>
      </table>
    </div>

    <Modal open={Boolean(editing)} onClose={busy ? undefined : () => setEditing(null)}>
      <h3>Editar producto</h3>
      <div className="grid grid-2">
        {Object.keys(base).map((k)=><input disabled={busy} key={k} placeholder={k} value={editForm[k] ?? ''} onChange={(e)=>setEditForm({...editForm,[k]:numericKeys.includes(k)?Number(e.target.value):e.target.value})} />)}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          disabled={busy}
          onClick={async()=>{
            if (isInvalid(editForm)) return alert('Valores inválidos: ram_gb, stock y precios no pueden ser negativos.');
            setBusy(true);
            try {
              await updateProduct(editForm);
              setEditing(null);
              await load(q);
            } catch (e: any) {
              alert(e?.message || 'No se pudo actualizar el producto.');
            } finally {
              setBusy(false);
            }
          }}
        >Guardar cambios</button>
        <button disabled={busy} onClick={()=>setEditing(null)}>Cancelar</button>
      </div>
    </Modal>
  </div>;
};
