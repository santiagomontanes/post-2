import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { CategoryScale, Chart as ChartJS, LinearScale, BarElement } from 'chart.js';
import { salesByDay, summary, topProducts } from '../services/reports';
ChartJS.register(CategoryScale, LinearScale, BarElement);

export const Reports = () => {
  const [data,setData]=useState<any[]>([]); const [top,setTop]=useState<any[]>([]); const [sum,setSum]=useState<any>({});
  const from = new Date(new Date().setDate(new Date().getDate()-30)).toISOString(); const to = new Date().toISOString();
  useEffect(()=>{ void (async()=>{ setData(await salesByDay(from,to)); setTop(await topProducts(from,to)); const s:any=await summary(from,to); setSum({...s, utility: s.total_sales - s.total_costs - s.total_expenses}); })(); },[]);
  return <div><div className="card"><h3>Ventas por día</h3><Bar data={{labels:data.map((d:any)=>d.day),datasets:[{label:'Ventas',data:data.map((d:any)=>d.total)}]}} /></div><div className="card"><h3>Top productos</h3>{top.map((t:any)=><div key={t.name}>{t.name}: {t.qty}</div>)}</div><div className="card"><h3>Resumen</h3><p>Ventas: {sum.total_sales}</p><p>Gastos: {sum.total_expenses}</p><p>Utilidad estimada: {sum.utility}</p></div></div>;
};
