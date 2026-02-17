import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  auth: {
    login: (email: string, password: string) => ipcRenderer.invoke('auth:login', email, password),
  },
  products: {
    list: (search: string) => ipcRenderer.invoke('products:list', search),
    save: (payload: unknown) => ipcRenderer.invoke('products:save', payload),
    update: (payload: unknown) => ipcRenderer.invoke('products:update', payload),
    delete: (id: string) => ipcRenderer.invoke('products:delete', id),
  },
  sales: {
    create: (payload: unknown) => ipcRenderer.invoke('sales:create', payload),
    printInvoice: (html: string) => ipcRenderer.invoke('sales:print-invoice', html),
  },
  expenses: {
    add: (payload: unknown) => ipcRenderer.invoke('expenses:add', payload),
    list: (from: string, to: string) => ipcRenderer.invoke('expenses:list', from, to),
  },
  cash: {
    open: (payload: unknown) => ipcRenderer.invoke('cash:open', payload),
    getOpen: () => ipcRenderer.invoke('cash:get-open'),
    close: (payload: unknown) => ipcRenderer.invoke('cash:close', payload),
  },
  reports: {
    salesByDay: (from: string, to: string) => ipcRenderer.invoke('reports:sales-by-day', from, to),
    topProducts: (from: string, to: string) => ipcRenderer.invoke('reports:top-products', from, to),
    summary: (from: string, to: string) => ipcRenderer.invoke('reports:summary', from, to),
  },
  backups: {
    export: () => ipcRenderer.invoke('backups:export'),
    restore: () => ipcRenderer.invoke('backups:restore'),
  },
});
