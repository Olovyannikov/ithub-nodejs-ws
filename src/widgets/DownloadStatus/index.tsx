import {useEffect, useState} from "react";
import {Socket} from 'socket.io-client';

interface DownloadStatusProps {
    socket: Socket;
}

export const DownloadStatus = ({socket}: DownloadStatusProps) => {
    const [status, setStatus] = useState({progress: 0, size: 0});

    useEffect(() => {
        socket.on('download_progress', (data) => {
            setStatus(data);
        });

        socket.on('download_completed', (data) => {
            setStatus(data);
        });

        return () => {
            socket.off('download_progress');
            socket.off('download_completed');
        };
    }, [socket]);

    return (
        <div>
            <p>Прогресс: {status.progress}%</p>
            <p>Размер: {status.size} байт</p>
        </div>
    );
};