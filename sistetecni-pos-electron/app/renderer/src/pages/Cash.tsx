import { useEffect, useMemo, useState } from 'react';
import { ipc } from '../services/ipcClient';

export const Cash = ({ user }: { user: any }) => {
  const [open, setOpen] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [opening, setOpening] = useState(0);
  const [counted, setCounted] = useState(0);

  const refresh = async (): Promise<void> => {
    setOpen(await ipc.cash.getOpen());
    setStatus(await ipc.cash.getStatus());
  };

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => {
      void refresh();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const expectedCash = status?.expectedCash ?? 0;
  const diff = useMemo(() => counted - expectedCash, [counted, expectedCash]);

  return (
    <div className="card">
      {open ? (
        <>
          <h3>Caja abierta</h3>
          <p>Fecha/Hora apertura: {status?.openedAt || open.opened_at}</p>
          <div className="grid grid-2">
            <div className="card"><b>Inicio de caja</b><p>{status?.openingCash ?? 0}</p></div>
            <div className="card"><b>Ventas en efectivo (turno)</b><p>{status?.cashSales ?? 0}</p></div>
            <div className="card"><b>Gastos (turno)</b><p>{status?.expenses ?? 0}</p></div>
            <div className="card"><b>Efectivo esperado</b><p>{expectedCash}</p></div>
          </div>

          <button onClick={() => void refresh()}>Refrescar</button>

          <div className="card">
            <h4>Cierre de caja</h4>
            <p>Efectivo esperado: {expectedCash}</p>
            <label>
              Efectivo contado:
              <input type="number" value={counted} onChange={(e) => setCounted(Number(e.target.value || 0))} />
            </label>
            <p>Diferencia: {diff}</p>
            <button
              onClick={async () => {
                const res = await ipc.cash.close({ id: open.id, countedCash: counted, userId: user.id, notes: '' });
                alert(`Cerrada. Dif: ${res.diff}. Backup: ${res.backupPath}`);
                setCounted(0);
                await refresh();
              }}
            >
              Confirmar cierre
            </button>
          </div>
        </>
      ) : (
        <>
          <h3>Abrir caja</h3>
          <input type="number" value={opening} onChange={(e) => setOpening(Number(e.target.value))} />
          <button
            onClick={async () => {
              await ipc.cash.open({ userId: user.id, openingCash: opening });
              await refresh();
            }}
          >
            Abrir caja
          </button>
        </>
      )}
    </div>
  );
};
