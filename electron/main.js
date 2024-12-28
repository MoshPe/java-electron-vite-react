const {app, BrowserWindow} = require('electron');
const {spawn, exec} = require('child_process');
const os = require('os');
const {join} = require("path");
const kill = require('tree-kill');
const log = require("electron-log");

let javaProcess;
let javaPid;
log.initialize();
let isProcessKilled = false;
const isDev = !app.isPackaged;

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });


    if (isDev) {
        win.loadURL('http://localhost:5173'); // Vite dev server URL
    } else {
        win.loadURL(`file://${join(__dirname, 'frontend/index.html')}`); // Vite dev server URL
    }
};

app.whenReady().then(() => {
    // Start the Java backend
    let javaJarPath;
    if(!isDev) {
        javaJarPath = join(__dirname, '..', 'build', 'backend', 'backend-jar-with-dependencies.jar');
        log.info('Java JAR Path:', javaJarPath);
        javaProcess = spawn('java', ['-jar', javaJarPath]);
        javaPid = javaProcess.pid;
        log.info(`Java Process pid: ${javaProcess.pid}`);
        javaProcess.stdout.on('data', (data) => {
            log.info(`Java: ${data}`);
        });

        javaProcess.stderr.on('data', (data) => {
            log.error(`Java Error: ${data}`);
        });
    }

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('will-quit', (event) => {
    if (isProcessKilled) return; // Prevent multiple triggers

    event.preventDefault(); // Delay the quit process
    console.log('Delaying quit to kill process.');
    if (javaProcess) {
        const child = spawn('taskkill', [`/F`, '/PID', javaProcess.pid,  '/T']);

        child.stdout.on('data', (data) => {
            console.log(`Output: ${data}`);
        });

        child.stderr.on('data', (data) => {
            console.error(`Error: ${data.toString()}`);
        });

        child.on('close', (code) => {
            console.log(`Process exited with code ${code}`);
            isProcessKilled = true;
            app.quit(); // Continue the quit process
        });

        child.on('error', (error) => {
            console.error(`Failed to execute command: ${error}`);
            isProcessKilled = true;
            app.quit(); // Ensure quit even if command fails
        });
    } else {
        app.quit();
    }

});

app.on('window-all-closed', () => {
    console.log('Window All Closed');
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

process.on('exit', async () => {
    app.quit();
});

app.on('quit', async () => {
    log.info('App has quit.');
});