import { useEffect, useState } from 'react';
import { ipc } from '../services/ipcClient';

export const Cash = ({ user }: { user: any }) => {
  const [open,setOpen]=useState<any>(null); const [opening,setOpening]=useState(0); const [counted,setCounted]=useState(0);
  const load=async()=>setOpen(await ipc.cash.getOpen());
  useEffect(()=>{ void load(); },[]);
  return <div className="card">{open? <><p>Caja abierta: {open.opened_at}</p><input type="number" value={counted} onChange={(e)=>setCounted(Number(e.target.value))} /><button onClick={async()=>{const res=await ipc.cash.close({id:open.id,countedCash:counted,userId:user.id,notes:''}); alert(`Cerrada. Dif: ${res.diff}. Backup: ${res.backupPath}`); await load();}}>Cerrar caja</button></> : <><input type="number" value={opening} onChange={(e)=>setOpening(Number(e.target.value))} /><button onClick={async()=>{await ipc.cash.open({userId:user.id,openingCash:opening}); await load();}}>Abrir caja</button></>}</div>;
};
