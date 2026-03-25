const { app, Menu, shell, BrowserWindow, ipcMain, globalShortcut, dialog } = require('electron');
const fs = require('fs');

function saveFile() {
  const window = BrowserWindow.getFocusedWindow();
  window.webContents.send('editor-event', 'save');
}

function loadFile() {
  const window = BrowserWindow.getFocusedWindow();
  const options = {
    title: 'Pick a markdown file',
    filters: [
      { name: 'Markdown files', extensions: ['md'] },
      { name: 'Text files', extensions: ['txt'] }
    ]
  };
  dialog.showOpenDialog(window, options, paths => {
    if (paths && paths.length > 0) {
      const content = fs.readFileSync(paths[0]).toString();
      window.webContents.send('load', content);
    }
  });
}

app.on('ready', () => {
    globalShortcut.register('CommandOrControl+S', () => {
        saveFile();
    });
    globalShortcut.register('CommandOrControl+O', () => {
        loadFile();
    });
});

const template = [
  // Menú "File" añadido
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        accelerator: 'CommandOrControl+O',
        click() { loadFile(); }
      },
      {
        label: 'Save',
        accelerator: 'CommandOrControl+S',
        click() { saveFile(); }
      }
    ]
  },
  {
    label: 'Format',
    submenu: [
      {
        label: 'Toggle Bold',
        click() {
          const window = BrowserWindow.getFocusedWindow();
          window.webContents.send('editor-event', 'toggle-bold');
        }
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'About Editor Component',
        click() {
          shell.openExternal('https://simplemde.com/');
        }
      }
    ]
  },
  {
    label: 'Debugging',
    submenu: [
      { label: 'Dev Tools', role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'reload', accelerator: 'Alt+R' }
    ]
  }
];

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  });
}

ipcMain.on('save', (event, arg) => {
  const window = BrowserWindow.getFocusedWindow();
  const options = {
    title: 'Save markdown file',
    filters: [
      { name: 'MyFile', extensions: ['md'] }
    ]
  };
  dialog.showSaveDialog(window, options, filename => {
    if (filename) {
      fs.writeFileSync(filename, arg);
    }
  });
});

const menu = Menu.buildFromTemplate(template);
module.exports = menu;