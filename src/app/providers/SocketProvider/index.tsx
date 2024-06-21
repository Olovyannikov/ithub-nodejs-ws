import {createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState} from "react";
import {connect, Socket} from "socket.io-client";
import {wsURL} from "@/shared/constants";
import {type DownloadedFileModel, type SocketMessage, SocketType} from "@/shared/types";

interface SocketProviderProps {
    socket?: Socket | null;
    workerCount?: { activeWorkers: number; maxWorkers: number; };
    urlList?: string[];
    searchTerm: string;
    setSearchTerm: (s: string) => void;
    error?: string;
    downloadProgress?: null | Record<number, DownloadedFileModel>;
    downloadedContent?: string[];
}

const SocketContext = createContext<SocketProviderProps>({} as SocketProviderProps);

export const SocketProvider = ({children}: PropsWithChildren) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [workerCount, setWorkerCount] = useState({activeWorkers: 0, maxWorkers: 0});
    const [urlList, setUrlList] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [error, setError] = useState('');
    const [downloadProgress, setDownloadProgress] = useState<null | Record<number, DownloadedFileModel>>(null);
    const [downloadedContent, setDownloadedContent] = useState<string[]>([]);

    const handleMessage = (message: SocketMessage) => {
        if (message.type === SocketType.WORKERS) {
            setWorkerCount({activeWorkers: message.activeWorkers ?? 0, maxWorkers: message.maxWorkers ?? 0});
        } else if (message.type === SocketType.URL_LIST) {
            setUrlList(message.urls ?? []);
        } else if (message.type === SocketType.PROGRESS) {
            setDownloadProgress(prev => ({
                ...prev,
                [message.id]: {
                    fileName: message.fileName,
                    progress: message.progress.toFixed(2),
                    downloadedLength: message.downloadedLength,
                    contentLength: message.contentLength
                }
            }));
        } else if (message.type === SocketType.COMPLETE) {
            console.log('COMPLETE!')
            setDownloadedContent(prev => [...prev, message.fileName]);
            setDownloadProgress(prev => {
                const updatedProgress = {...prev};
                delete updatedProgress[Number(message.id)];
                return updatedProgress;
            });
        } else if (message.type === SocketType.ERROR) {
            console.error(message.type, message.message);
            setError(message.message ?? '')
        }
    };

    useEffect(() => {
        const socketInstance = connect(wsURL, {
            path: '/wss'
        });
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            console.log('Connected to server');
        });

        socketInstance.on('url_list', (message: SocketMessage) => {
            handleMessage(message);
        });

        socketInstance.on('progress', (message: SocketMessage) => {
            handleMessage(message);
        });

        socketInstance.on('workers', (message: SocketMessage) => {
            handleMessage(message);
        });

        socketInstance.on('complete', (message: SocketMessage) => {
            console.log('here complete')
            handleMessage(message);
        });

        socketInstance.on('error', (message: SocketMessage) => {
            handleMessage(message);
        });

        socketInstance.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    useEffect(() => {
        setError('');
    }, [urlList]);

    const memoizedValues = useMemo(() => ({
        socket, workerCount, urlList, searchTerm, setSearchTerm, error, downloadProgress, downloadedContent
    }), [socket, workerCount, urlList, searchTerm, error, downloadProgress, downloadedContent]);


    return <SocketContext.Provider value={memoizedValues}>{children}</SocketContext.Provider>
}

export const useSocketStore = () => {
    const ctx = useContext(SocketContext);
    if (!ctx) throw Error('SocketContext uses only with Provider');
    return ctx;
}