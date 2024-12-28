const {spawn, exec} = require('child_process');
const os = require('os');
const {join} = require("path");

const javaJarPath = join(__dirname, '..', 'backend', 'backend-jar-with-dependencies.jar');

javaProcess = spawn('java', ['-jar', javaJarPath]);
const isWindows = process.platform === 'win32';

const command = isWindows
    ? `taskkill /F /PID ${javaProcess.pid} /T`
    : `kill -9 $(lsof -t -i:8084)`;

const child = spawn(isWindows ? 'cmd.exe' : 'bash', [isWindows ? '/c' : '-c', command], {
    shell: true
});

child.stdout.on('data', (data) => {
    console.log(`Output: ${data}`);
});

child.stderr.on('data', (data) => {
    console.error(`Error: ${data.toString()}`);
});