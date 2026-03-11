declare global {
  interface Window {
    api: any;
  }
}

export const ipc = window.api;
