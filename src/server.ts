import express from 'express';
import {createServer} from 'http';
import {Server} from 'socket.io';
import {createReadStream, statSync} from 'fs';
import {getResourceFilename, getURLS} from './shared/api';

const port = 443;
const resourcePath = '../public/';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    path: '/wss'
});

app.use(express.static('./public'));

httpServer.listen(port, () => {
    console.log(`HTTP сервер запущен на порту ${port}`);
    console.log(`Socket.IO сервер запущен на пути /wss`);
});

io.on('connection', (socket) => {
    console.log('Новое соединение установлено');

    socket.on('message', async (message: string) => {
        let msg: {type: string, id?: string, name?: string};

        try {
            msg = JSON.parse(message);
        } catch (e) {
            console.error('Ошибка разбора сообщения:', e);
            return;
        }

        switch (msg.type) {
            case 'getResourceFilename': {
                if (!msg.id) {
                    socket.emit('error', 'Message missing required field: id');
                    return;
                }

                const filename = getResourceFilename(msg.id);

                if (!filename) {
                    socket.emit('error', 'Resource not found');
                    return;
                }

                const filePath = resourcePath + filename;
                const fileStat = statSync(filePath);

                socket.emit('fileInfo', {
                    name: filename,
                    size: fileStat.size
                });

                const readStream = createReadStream(filePath);
                readStream.on('data', (chunk) => {
                    socket.emit('file', chunk);
                });
                readStream.on('end', () => {
                    socket.emit('end', 'File stream end');
                });
                readStream.on('error', (err) => {
                    socket.emit('error', 'File stream error: ' + err.message);
                });
                break;
            }
            case 'add': {
                if (!msg.name) {
                    socket.emit('error', 'Message missing required field: name');
                    return;
                }

                const name = msg.name.toLowerCase();
                const urls_data = await getURLS(name);
                socket.emit('response', urls_data);
                break;
            }
            default:
                console.log('Неизвестный тип сообщения:', msg.type);
        }
    });

    socket.on('disconnect', () => {
        console.log('Пользователь отключился');
    });
});