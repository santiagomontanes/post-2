import { useEffect, useState } from 'react';
import { listAudit } from '../services/audit';
import { listUsersBasic } from '../services/users';

const ACTIONS = ['', 'USER_CREATE', 'USER_RESET_PASSWORD', 'SALE_CREATE', 'SALE_VOID', 'CASH_OPEN', 'CASH_CLOSE', 'PRODUCT_SAVE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE', 'BACKUP_CREATE'];

type BasicUser = { id: string; name: string; email: string; role: string };

export const Audit = () => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [actorId, setActorId] = useState('');
  const [action, setAction] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [users, setUsers] = useState<BasicUser[]>([]);
  const [usersError, setUsersError] = useState('');
  const [openId, setOpenId] = useState('');

  const load = async (): Promise<void> => {
    const data = await listAudit({
      from: `${from}T00:00:00.000Z`,
      to: `${to}T23:59:59.999Z`,
      actorId: actorId.trim() || undefined,
      action: action || undefined,
      limit: 200,
      offset: 0,
    });
    setItems(Array.isArray(data) ? data : []);
  };

  const loadUsers = async (): Promise<void> => {
    try {
      const data = await listUsersBasic();
      setUsers(Array.isArray(data) ? (data as BasicUser[]) : []);
      setUsersError('');
    } catch {
      setUsers([]);
      setUsersError('No se pudo cargar usuarios');
    }
  };

  useEffect(() => {
    void load();
    void loadUsers();
  }, []);

  return (
    <div>
      <div className="card grid">
        <h2>Auditoría</h2>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <select value={actorId} onChange={(e) => setActorId(e.target.value)} disabled={users.length === 0}>
          <option value="">Todos los usuarios</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{`${u.name} (${u.role}) - ${u.email}`}</option>
          ))}
        </select>
        {usersError ? <small>{usersError}</small> : null}
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          {ACTIONS.map((a) => <option key={a || 'all'} value={a}>{a || 'Todas las acciones'}</option>)}
        </select>
        <button onClick={() => void load()}>Filtrar</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>created_at</th><th>actor</th><th>action</th><th>entity_type</th><th>entity_id</th><th>metadata</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const metadataText = i?.metadata ? String(i.metadata) : '';
              return (
                <tr key={i.id}>
                  <td>{i.created_at}</td>
                  <td>{i.actor_name || i.actor_email || i.actor_user_id}</td>
                  <td>{i.action}</td>
                  <td>{i.entity_type}</td>
                  <td>{i.entity_id || '-'}</td>
                  <td>
                    <span>{metadataText ? `${metadataText.slice(0, 80)}${metadataText.length > 80 ? '…' : ''}` : '-'}</span>
                    {metadataText ? <button onClick={() => setOpenId(openId === i.id ? '' : i.id)}>Ver detalle</button> : null}
                    {openId === i.id ? <pre>{metadataText}</pre> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
