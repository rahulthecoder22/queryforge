import { app, BrowserWindow, ipcMain, Menu, dialog, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { DatabaseManager } from './services/DatabaseManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
const dbManager = new DatabaseManager();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#0f1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (isDev) {
    void mainWindow.loadURL('http://localhost:5180');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function broadcast(channel: string) {
  mainWindow?.webContents.send(channel);
}

function buildMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Database',
          accelerator: 'Cmd+N',
          click: () => broadcast('new-database'),
        },
        {
          label: 'Open Database…',
          accelerator: 'Cmd+O',
          click: async () => {
            const { canceled, filePaths } = await dialog.showOpenDialog({
              properties: ['openFile'],
              filters: [{ name: 'SQLite', extensions: ['db', 'sqlite', 'sqlite3'] }],
            });
            if (!canceled && filePaths[0]) {
              mainWindow?.webContents.send('open-database-path', filePaths[0]);
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'Cmd+,',
          click: () => broadcast('open-settings'),
        },
      ],
    },
    {
      label: 'Query',
      submenu: [
        { label: 'Run Query', accelerator: 'Cmd+Enter', click: () => broadcast('run-query') },
        { label: 'Explain Query', accelerator: 'Cmd+E', click: () => broadcast('explain-query') },
        { type: 'separator' },
        { label: 'New Query Tab', accelerator: 'Cmd+T', click: () => broadcast('new-tab') },
        { label: 'Close Tab', accelerator: 'Cmd+W', click: () => broadcast('close-tab') },
      ],
    },
    {
      label: 'Learn',
      submenu: [
        { label: 'Course Map', accelerator: 'Cmd+L', click: () => broadcast('goto-learn') },
        { label: 'Document Lab', accelerator: 'Cmd+D', click: () => broadcast('goto-documents') },
        { label: 'Dashboard', click: () => broadcast('goto-dashboard') },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'QueryForge Docs',
          click: () => void shell.openExternal('https://github.com'),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function registerIpc() {
  ipcMain.handle('db:execute', async (_, payload: { dbPath: string; sql: string }) => {
    return dbManager.execute(payload.dbPath, payload.sql);
  });

  ipcMain.handle('db:execute-multiple', async (_, payload: { dbPath: string; sql: string }) => {
    return dbManager.executeMultiple(payload.dbPath, payload.sql);
  });

  ipcMain.handle('db:explain', async (_, payload: { dbPath: string; sql: string }) => {
    return dbManager.explain(payload.dbPath, payload.sql);
  });

  ipcMain.handle('db:get-schema', async (_, payload: { dbPath: string }) => {
    return dbManager.getSchema(payload.dbPath);
  });

  ipcMain.handle('db:create', async (_, payload: { name: string }) => {
    return dbManager.createDatabase(payload.name);
  });

  ipcMain.handle('db:list', async () => dbManager.listDatabases());

  ipcMain.handle('db:set-active', async (_, payload: { dbPath: string | null }) => {
    dbManager.setActiveDatabase(payload.dbPath);
    return true;
  });

  ipcMain.handle('db:get-active', async () => dbManager.getActiveDatabase());

  ipcMain.handle('db:import-sql', async (_, payload: { dbPath: string; sqlFilePath: string }) => {
    await dbManager.importSQLFile(payload.dbPath, payload.sqlFilePath);
    return true;
  });

  ipcMain.handle('db:copy-sample', async (_, payload: { fileName: string }) => {
    return dbManager.copySampleToData(payload.fileName);
  });

  ipcMain.handle('db:generate-masterclass', async (_, payload: { schemaId: string }) => {
    return dbManager.generateMasterclassDatabase(payload.schemaId);
  });

  ipcMain.handle('db:get-paths', async () => ({
    dataDir: dbManager.getDataDirectory(),
    sampleDir: dbManager.getSampleDatabasesDir(),
  }));

  ipcMain.handle('dialog:open-file', async (_, opts: Electron.OpenDialogOptions) => {
    return mainWindow
      ? dialog.showOpenDialog(mainWindow, opts)
      : dialog.showOpenDialog(opts);
  });

  ipcMain.handle('dialog:save-file', async (_, opts: Electron.SaveDialogOptions) => {
    return mainWindow
      ? dialog.showSaveDialog(mainWindow, opts)
      : dialog.showSaveDialog(opts);
  });

  ipcMain.handle('course:get-progress', async () => {
    const p = dbManager.getProgressFilePath();
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, 'utf8');
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  });

  ipcMain.handle('course:save-progress', async (_, data: unknown) => {
    const p = dbManager.getProgressFilePath();
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    return true;
  });
}

app.whenReady().then(() => {
  buildMenu();
  registerIpc();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  void dbManager.closeAll();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  void dbManager.closeAll();
});
