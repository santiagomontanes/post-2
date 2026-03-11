import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  auth: {
    login: (email: string, password: string) => ipcRenderer.invoke('auth:login', email, password),
  },
  products: {
    list: (payload: unknown) => ipcRenderer.invoke('products:list', payload),
    listForPos: (payload: unknown) => ipcRenderer.invoke('pos:products:list', payload),
    save: (payload: unknown) => ipcRenderer.invoke('products:save', payload),
    update: (payload: unknown) => ipcRenderer.invoke('products:update', payload),
    archive: (payload: unknown) => ipcRenderer.invoke('products:archive', payload),
  },
  sales: {
    create: (payload: unknown) => ipcRenderer.invoke('sales:create', payload),
    printInvoice: (payload: unknown) => ipcRenderer.invoke('sales:print-invoice', payload),
  },
  expenses: {
    add: (payload: unknown) => ipcRenderer.invoke('expenses:add', payload),
    list: (payload: unknown) => ipcRenderer.invoke('expenses:list', payload),
  },
  cash: {
    open: (payload: unknown) => ipcRenderer.invoke('cash:open', payload),
    getOpen: (payload: unknown) => ipcRenderer.invoke('cash:get-open', payload),
    getStatus: (payload: unknown) => ipcRenderer.invoke('cash:get-status', payload),
    getOpenSuggestion: (payload: unknown) => ipcRenderer.invoke('cash:get-open-suggestion', payload),
    close: (payload: unknown) => ipcRenderer.invoke('cash:close', payload),
  },
  reports: {
    salesByDay: (payload: unknown) => ipcRenderer.invoke('reports:sales-by-day', payload),
    topProducts: (payload: unknown) => ipcRenderer.invoke('reports:top-products', payload),
    summary: (payload: unknown) => ipcRenderer.invoke('reports:summary', payload),
    todaySummary: (payload: unknown) => ipcRenderer.invoke('reports:today-summary', payload),
    last7DaysSales: (payload: unknown) => ipcRenderer.invoke('reports:last-7-days-sales', payload),
  },

  users: {
    list: (payload: unknown) => ipcRenderer.invoke('users:list', payload),
    listBasic: (payload: unknown) => ipcRenderer.invoke('users:list-basic', payload),
    create: (payload: unknown) => ipcRenderer.invoke('users:create', payload),
    resetPassword: (payload: unknown) => ipcRenderer.invoke('users:reset-password', payload),
  },
  audit: {
    list: (payload: unknown) => ipcRenderer.invoke('audit:list', payload),
  },
  backups: {
    createManual: (payload: unknown) => ipcRenderer.invoke('backup:create-manual', payload),
    export: (payload: unknown) => ipcRenderer.invoke('backups:export', payload),
    restore: (payload: unknown) => ipcRenderer.invoke('backups:restore', payload),
  },
});
