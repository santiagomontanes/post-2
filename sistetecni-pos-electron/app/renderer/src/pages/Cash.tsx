import { useEffect, useState } from 'react';
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

  return (
    <div className="card">
      {open ? (
        <>
          <p>Caja abierta: {open.opened_at}</p>
          <div className="grid grid-2">
            <div className="card"><b>Apertura</b><p>{status?.openingCash ?? 0}</p></div>
            <div className="card"><b>Ventas en efectivo</b><p>{status?.cashSales ?? 0}</p></div>
            <div className="card"><b>Gastos</b><p>{status?.expenses ?? 0}</p></div>
            <div className="card"><b>Efectivo esperado (en vivo)</b><p>{status?.expectedCash ?? 0}</p></div>
          </div>

          <button onClick={() => void refresh()}>Refrescar</button>
          <input type="number" value={counted} onChange={(e) => setCounted(Number(e.target.value))} />
          <button
            onClick={async () => {
              const res = await ipc.cash.close({ id: open.id, countedCash: counted, userId: user.id, notes: '' });
              alert(`Cerrada. Dif: ${res.diff}. Backup: ${res.backupPath}`);
              await refresh();
            }}
          >
            Cerrar caja
          </button>
        </>
      ) : (
        <>
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
