import { ipc } from './ipcClient';
export const exportBackup = () => ipc.backups.export();
export const restoreBackup = () => ipc.backups.restore();
