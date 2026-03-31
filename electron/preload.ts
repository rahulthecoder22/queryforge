import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

const validChannels = [
  'new-database',
  'open-database-path',
  'open-settings',
  'run-query',
  'explain-query',
  'new-tab',
  'close-tab',
  'goto-learn',
  'goto-dashboard',
  'goto-documents',
] as const;

type AppChannel = (typeof validChannels)[number];

contextBridge.exposeInMainWorld('queryforge', {
  db: {
    execute: (dbPath: string, sql: string) =>
      ipcRenderer.invoke('db:execute', { dbPath, sql }),
    executeMultiple: (dbPath: string, sql: string) =>
      ipcRenderer.invoke('db:execute-multiple', { dbPath, sql }),
    explain: (dbPath: string, sql: string) =>
      ipcRenderer.invoke('db:explain', { dbPath, sql }),
    getSchema: (dbPath: string) => ipcRenderer.invoke('db:get-schema', { dbPath }),
    create: (name: string) => ipcRenderer.invoke('db:create', { name }),
    listDatabases: () => ipcRenderer.invoke('db:list'),
    setActive: (dbPath: string | null) =>
      ipcRenderer.invoke('db:set-active', { dbPath }),
    getActive: () => ipcRenderer.invoke('db:get-active'),
    importSQL: (dbPath: string, sqlFilePath: string) =>
      ipcRenderer.invoke('db:import-sql', { dbPath, sqlFilePath }),
    copySample: (fileName: string) =>
      ipcRenderer.invoke('db:copy-sample', { fileName }),
    generateMasterclass: (schemaId: string) =>
      ipcRenderer.invoke('db:generate-masterclass', { schemaId }),
    getPaths: () => ipcRenderer.invoke('db:get-paths'),
  },
  course: {
    getProgress: () => ipcRenderer.invoke('course:get-progress'),
    saveProgress: (data: unknown) => ipcRenderer.invoke('course:save-progress', data),
  },
  dialog: {
    openFile: (options: Electron.OpenDialogOptions) =>
      ipcRenderer.invoke('dialog:open-file', options),
    saveFile: (options: Electron.SaveDialogOptions) =>
      ipcRenderer.invoke('dialog:save-file', options),
  },
  on: (channel: AppChannel, callback: (...args: unknown[]) => void) => {
    if (!validChannels.includes(channel)) return () => {};
    const handler = (_: IpcRendererEvent, ...args: unknown[]) => callback(...args);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  },
});
