import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import path from 'path';
import {fileURLToPath} from "url";
import {Worker} from 'worker_threads';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 443;
const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server, {
    path: "/wss",
    cors: {
        origin: '*'
    }
});

const keywordsToUrls: { [key: string]: string[] } = {
    'tinycore': [
        'http://www.tinycorelinux.net/15.x/x86/release/Core-current.iso',
        'http://www.tinycorelinux.net/14.x/x86/archive/14.0/Core-14.0.iso',
        'http://www.tinycorelinux.net/13.x/x86/archive/13.1/Core-13.1.iso'
    ],
    'slitaz': [
        'https://download.tuxfamily.org/slitaz/iso/5.0-rc/slitaz-5.0-rc3.iso',
        'https://download.tuxfamily.org/slitaz/iso/stable/slitaz-4.0.iso',
        'https://download.tuxfamily.org/slitaz/iso/latest/slitaz-rolling-core64.iso'
    ],
    'alpine': [
        'https://dl-cdn.alpinelinux.org/alpine/v3.20/releases/x86/alpine-standard-3.20.0-x86.iso',
        'https://dl-cdn.alpinelinux.org/alpine/v3.20/releases/x86_64/alpine-standard-3.20.0-x86_64.iso',
        'https://dl-cdn.alpinelinux.org/alpine/v3.20/releases/x86_64/alpine-virt-3.20.0-x86_64.iso'
    ]
};

const WORKERS_CONFIG = {
    MAX_WORKERS: '2',
    SPEED_LIMIT: '1024'
}

let activeWorkers = 0;
let threadId = 1;
const queuedDownloads: (() => void)[] = [];
const maxWorkers = parseInt(WORKERS_CONFIG.MAX_WORKERS || '4');
const speedLimit = parseInt(WORKERS_CONFIG.SPEED_LIMIT || '100') * 1024 * 1024;

io.on('connection', (socket) => {
    socket.on('message', async (message) => {
        console.log(message)
        const {type, keyword, url} = message

        if (type === 'get_urls') {
            console.log('yess')
            if (keywordsToUrls[keyword]) {
                socket.emit('url_list', {type: 'url_list', urls: keywordsToUrls[keyword]});
            } else {
                socket.emit('error', {type: 'error', message: 'Keyword not found'});
            }
        } else if (type === 'download') {
            const filePath = path.join(__dirname, '..', 'public', path.basename(url));

            if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath), {recursive: true});
            }
            if (activeWorkers < maxWorkers) {
                startDownload(socket, url, filePath);
            } else {
                queuedDownloads.push(() => startDownload(socket, url, filePath));
            }
        }
    });
});

const startDownload = (socket: any, url: string, filePath: string) => {
    activeWorkers++;
    threadId++;
    socket.emit('workers', {type: 'workers', threadId, activeWorkers, maxWorkers});

    const worker = new Worker(path.resolve(__dirname, 'worker.js'), {
        workerData: {url, filePath, threadId, speedLimit}
    });

    worker.on('message', (message) => {
        if (message.type === 'progress') {
            socket.emit('progress', {...message, threadId: message.threadId, fileName: message.fileName});
        } else if (message.type === 'complete') {
            socket.emit('complete', {type: 'complete', fileName: message.fileName});
        }
    });

    worker.on('error', (error) => {
        socket.emit('error', {type: 'error', message: error.message});
    });

    worker.on('exit', (code) => {
        activeWorkers--;
        const threadIdFake = 0;
        socket.emit('worker_count', {threadIdFake, activeWorkers, maxWorkers});

        if (code !== 0) {
            socket.emit('error', {type: 'error', message: `Worker stopped with exit code ${code}`});
        }

        if (activeWorkers < maxWorkers && queuedDownloads.length > 0) {
            const nextDownload = queuedDownloads.shift();
            nextDownload && nextDownload();
        }
    });
};

server.listen(port, () => {
    console.log(`Сервер запущен на ${port} порту`);
});
