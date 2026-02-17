import { useEffect, useMemo, useState } from 'react';
import { ipc } from '../services/ipcClient';

export const Cash = ({ user }: { user: any }) => {
  const [open, setOpen] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [opening, setOpening] = useState(0);
  const [openingNotes, setOpeningNotes] = useState('');
  const [counted, setCounted] = useState(0);

  const refresh = async (): Promise<void> => {
    const [openCash, cashStatus, openSuggestion] = await Promise.all([
      ipc.cash.getOpen(),
      ipc.cash.getStatus(),
      ipc.cash.getOpenSuggestion(),
    ]);
    setOpen(openCash);
    setStatus(cashStatus);
    setSuggestion(openSuggestion);

    if (!openCash && typeof openSuggestion?.suggestedOpeningCash === 'number') {
      setOpening(openSuggestion.suggestedOpeningCash);
    }
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
  const hasSuggestion = typeof suggestion?.suggestedOpeningCash === 'number';
  const openingDiffersFromSuggestion = hasSuggestion && Number(opening) !== Number(suggestion.suggestedOpeningCash);

  return (
    <div className="card">
      {open ? (
        <>
          <h3>Caja abierta</h3>
          <p>Fecha/Hora apertura: {status?.openedAt || open.opened_at}</p>
          {hasSuggestion && <p>Sugerido último cierre: {suggestion.suggestedOpeningCash}</p>}

          <div className="grid grid-2">
            <div className="card"><b>Inicio de caja</b><p>{status?.openingCash ?? open.opening_cash ?? 0}</p></div>
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
          <p>Efectivo sugerido (último cierre): {hasSuggestion ? suggestion.suggestedOpeningCash : 'Sin datos previos'}</p>
          {suggestion?.lastClosedAt ? <p>Último cierre: {suggestion.lastClosedAt}</p> : null}
          <label>
            Efectivo inicial (hoy):
            <input type="number" value={opening} onChange={(e) => setOpening(Number(e.target.value || 0))} />
          </label>

          {openingDiffersFromSuggestion ? (
            <label>
              Nota / Justificación:
              <textarea value={openingNotes} onChange={(e) => setOpeningNotes(e.target.value)} rows={3} />
            </label>
          ) : null}

          <button
            onClick={async () => {
              if (openingDiffersFromSuggestion && !openingNotes.trim()) {
                alert('Debes ingresar una nota/justificación cuando el efectivo inicial difiere del sugerido.');
                return;
              }
              await ipc.cash.open({ userId: user.id, openingCash: opening, openingNotes: openingNotes.trim() });
              setOpeningNotes('');
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
