import { ipc } from './ipcClient';

export const createManualBackup = () => ipc.backups.createManual();
export const exportBackup = () => ipc.backups.export();
export const restoreBackup = () => ipc.backups.restore();
