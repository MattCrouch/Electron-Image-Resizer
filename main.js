const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

//Keep a reference to the window to avoid it being garbage collected
let mainWindow;

function createWindow () {
  //Initialise the main window
  mainWindow = new BrowserWindow({width: 700, height: 525, show: false, backgroundColor: "rgb(250,250,250)"});

  //Only show window once all processes are ready to go
  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
  });

  //Load the initial page
  mainWindow.loadURL(`file://${__dirname}/app/html/index.html`);

  //Lose reference to the window once closed
  mainWindow.on("closed", function () {
    mainWindow = null
  });
};

//Create the main window when the app has started
app.on("ready", createWindow);

//Quit app when main window is closed
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    //...except on OSX, where it's expected to stay open until explicitly quit
    app.quit()
  }
});

//Create a new window if app was closed, then re-opened on OSX
app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

//Helper method to load pages from main process
ipcMain.on("loadPage", (event, arg) => {
    mainWindow.loadURL(`file://${__dirname}/app/${arg}`);
});