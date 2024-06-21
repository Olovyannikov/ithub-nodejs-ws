export enum SocketType {
    WORKERS = 'workers',
    URL_LIST = 'url_list',
    COMPLETE = 'complete',
    PROGRESS = 'progress',
    ERROR = 'error'
}

export interface SocketMessage extends DownloadedFileModel {
    type: SocketType;
    id: string | number;
    activeWorkers?: number;
    maxWorkers?: number;
    urls?: string[];
    message?: string;
}

export interface DownloadedFileModel {
    fileName: string,
    progress: number,
    downloadedLength: number,
    contentLength: number
}