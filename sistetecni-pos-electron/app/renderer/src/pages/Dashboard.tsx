import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { CategoryScale, Chart as ChartJS, LinearScale, BarElement } from 'chart.js';
import { last7DaysSales, todaySummary } from '../services/reports';
import { ipc } from '../services/ipcClient';
import { getAuthContext } from '../services/session';

ChartJS.register(CategoryScale, LinearScale, BarElement);

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [today, setToday] = useState<any>({ total_sales: 0, cash_sales: 0, total_expenses: 0, total_costs: 0 });
  const [cashStatus, setCashStatus] = useState<any>(null);
  const [sales7, setSales7] = useState<any[]>([]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError('');
      try {
        const [t, s7, cash] = await Promise.all([todaySummary(), last7DaysSales(), ipc.cash.getStatus(getAuthContext())]);
        setToday(t ?? { total_sales: 0, cash_sales: 0, total_expenses: 0, total_costs: 0 });
        setSales7(s7 ?? []);
        setCashStatus(cash);
      } catch (e: any) {
        setError(e?.message || 'No se pudo cargar el dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const utility = (today.total_sales || 0) - (today.total_costs || 0) - (today.total_expenses || 0);

  if (loading) return <div className="card">Cargando dashboard...</div>;
  if (error) return <div className="card">Error: {error}</div>;

  return (
    <div>
      <div className="grid grid-2">
        <div className="card"><h3>Ventas hoy</h3><p>{today.total_sales || 0}</p></div>
        <div className="card"><h3>Ventas en efectivo hoy</h3><p>{today.cash_sales || 0}</p></div>
        <div className="card"><h3>Gastos hoy</h3><p>{today.total_expenses || 0}</p></div>
        <div className="card"><h3>Utilidad estimada hoy</h3><p>{utility}</p></div>
      </div>

      {cashStatus && (
        <div className="card">
          <h3>Caja abierta (turno actual)</h3>
          <p>Efectivo esperado actual: {cashStatus.expectedCash}</p>
        </div>
      )}

      <div className="card">
        <h3>Ventas por día (últimos 7 días)</h3>
        <Bar
          data={{
            labels: sales7.map((d: any) => d.day),
            datasets: [{ label: 'Ventas', data: sales7.map((d: any) => d.total) }],
          }}
        />
      </div>
    </div>
  );
};
