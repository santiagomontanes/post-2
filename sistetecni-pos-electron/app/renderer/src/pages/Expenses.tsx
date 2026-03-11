import { useEffect, useState } from 'react';
import { addExpense, listExpenses } from '../services/expenses';

export const Expenses = () => {
  const today = new Date().toISOString();
  const [from,setFrom]=useState(today.slice(0,10)); const [to,setTo]=useState(today.slice(0,10));
  const [concept,setConcept]=useState(''); const [amount,setAmount]=useState(0); const [notes,setNotes]=useState(''); const [items,setItems]=useState<any[]>([]);
  const load=async()=>setItems(await listExpenses(`${from}T00:00:00.000Z`,`${to}T23:59:59.999Z`));
  useEffect(()=>{ void load(); },[]);
  return <div><div className="card grid"><input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} /><input type="date" value={to} onChange={(e)=>setTo(e.target.value)} /><button onClick={load}>Filtrar</button><input placeholder="Concepto" value={concept} onChange={(e)=>setConcept(e.target.value)} /><input type="number" placeholder="Monto" value={amount} onChange={(e)=>setAmount(Number(e.target.value))} /><input placeholder="Notas" value={notes} onChange={(e)=>setNotes(e.target.value)} /><button onClick={async()=>{await addExpense({date:new Date().toISOString(),concept,amount,notes});setConcept('');setAmount(0);setNotes('');await load();}}>Registrar gasto</button></div><div className="card">{items.map((i:any)=><div key={i.id}>{i.date} - {i.concept} - {i.amount}</div>)}</div></div>;
};
