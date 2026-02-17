import { createManualBackup, exportBackup, restoreBackup } from '../services/backups';

export const Settings = ({ role }: { role: string }) => (
  <div className="card">
    <h2>Configuración</h2>
    <button onClick={async () => alert(await createManualBackup())}>Crear backup ahora</button>
    <button onClick={async () => alert(await exportBackup())}>Exportar backup</button>
    {role === 'ADMIN' && <button onClick={async () => alert(await restoreBackup())}>Restaurar backup</button>}
    <p>Admin inicial: admin@sistetecni.com / Admin123*</p>
  </div>
);
