import { parentPort, workerData } from 'worker_threads';
import axios from 'axios';
import fs from 'fs';

const { url, filePath, threadId, speedLimit } = workerData;

const downloadFile = async () => {
    const writer = fs.createWriteStream(filePath);
    const response = await axios.get(url, {
        responseType: 'stream'
    });

    const totalLength = parseInt(response.headers['content-length'], 10);
    let downloadedLength = 0;

    response.data.on('data', (chunk: any) => {
        downloadedLength += chunk.length;
        parentPort?.postMessage({
            type: 'progress',
            threadId,
            fileName: filePath,
            progress: (downloadedLength / totalLength) * 100,
            downloadedLength,
            contentLength: totalLength
        });
        if (downloadedLength > speedLimit) {
            response.data.pause();
            setTimeout(() => response.data.resume(), 1000);
        }
    });

    response.data.pipe(writer);

    writer.on('finish', () => {
        parentPort?.postMessage({ type: 'complete', fileName: filePath });
    });

    writer.on('error', (err) => {
        parentPort?.postMessage({ type: 'error', message: err.message });
    });
};

downloadFile();
