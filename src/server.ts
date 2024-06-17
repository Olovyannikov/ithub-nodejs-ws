import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import {v4 as uuid} from 'uuid';
import {getResourceFilename, getURLS} from './shared/api';
import {createReadStream, statSync} from 'fs';
import path from 'path';
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 443;
const resourcePath = path.join(__dirname, '../public');
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    path: "/wss",
    cors: {
        origin: '*'
    }
});

io.on('connection', (socket) => {
    const clientId = uuid();
    console.log(`Новый пользователь: ${clientId}`);

    socket.on('disconnect', () => {
        console.log(`Пользователь отключился: ${clientId}`);
    });

    socket.on('message', async (message) => {
        try {
            const jsonMessage = JSON.parse(message);
            const urls = await getURLS(jsonMessage.data);
            console.log({jsonMessage, urls})

            switch (jsonMessage.action) {
                case 'GET_URLS':
                    console.log(`Получено сообщение: ${jsonMessage.data}`);
                    if (urls.length > 0) {
                        socket.emit('urlsInfo', {urls});
                    } else {
                        socket.emit('message', {data: 'empty'});
                        console.log('Нет данных по введенному ключевому слову.');
                    }
                    break;
                case 'GET_CONTENT':
                    try {
                        const contentInfo = await getContentInfo(jsonMessage.data);
                        socket.emit('contentInfo', {data: contentInfo});

                        const readStream = createReadStream(path.join(resourcePath, contentInfo.filename));
                        readStream.on('readable', () => {
                            let buf;
                            while ((buf = readStream.read()) !== null) {
                                socket.emit('file', buf);
                            }
                        });
                        readStream.on('end', () => {
                            socket.emit('fileEnd');
                            console.log('Передача данных завершена');
                        });
                    } catch (error) {
                        socket.emit('error', {data: 'empty'});
                    }
                    break;
                default:
                    socket.emit('message', 'empty');
                    console.log('Неизвестный запрос на сервер');
                    break;
            }
        } catch (error) {
            console.log('Error', error);
        }
    });
});

async function getContentInfo(id: string) {
    console.log(`Запрошен контент с id ${id}`);
    const filename = getResourceFilename(id);
    console.log(filename);
    const fileSize = statSync(path.join(resourcePath, filename)).size;
    console.log('fsize', fileSize)
    const fileExt = path.extname(filename).slice(1);
    return {id, filename, fileSize, fileExt};
}

server.listen(port, () => {
    console.log(`Сервер запущен на ${port} порту`);
});
