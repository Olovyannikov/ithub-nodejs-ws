import { useState, useEffect } from 'react';
import {connect} from 'socket.io-client';

const SERVER_ADDRESS = 'localhost';
const wsURL = `ws://${SERVER_ADDRESS}:443`;

interface URLInfo {
    id: number;
    link: string;
}

interface ContentInfo {
    id: string;
    filename: string;
    fileSize: number;
    fileExt: string;
}

const socket = connect(wsURL, {
    path: '/wss'
});

const App: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [urls, setUrls] = useState<URLInfo[]>([]);
    const [localContent, setLocalContent] = useState<string[]>([]);
    const [contentInfo, setContentInfo] = useState<ContentInfo | null>(null);
    const [buffer, setBuffer] = useState<ArrayBuffer[]>([]);
    const [tempSize, setTempSize] = useState<number>(0);

    useEffect(() => {

        socket.on('urlsInfo', (data: {urls: URLInfo[]}) => {
            setUrls(data.urls);
        });

        socket.on('contentInfo', (data: ContentInfo) => {
            setContentInfo(data);
        }).on('error', (data: { id: string; data: string }) => {
            alert(`Ошибка: ${data.data}`);
        }).on('file', (data: ArrayBuffer) => {
            const dataArray = new Uint8Array(data);
            if (dataArray.byteLength >= tempSize) {
                setBuffer((prev) => [...prev, dataArray]);
                setTempSize(dataArray.byteLength);
            } else {
                setBuffer((prev) => [...prev, dataArray]);
                setTempSize(0);
                console.log('Загрузка завершена');
                const jpegFile = new File([new Blob(buffer)], contentInfo?.filename || '', {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                const url = URL.createObjectURL(jpegFile);
                localStorage.setItem(`contentLocalId-${contentInfo?.id}`, url);
                setLocalContent((prev) => [...prev, url]);
            }
        });

        console.log('useEffect')

        return () => {
            socket.off();
        };

    }, [buffer, contentInfo?.filename, contentInfo?.id, tempSize]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        socket?.send(JSON.stringify({ action: 'GET_URLS', data: searchTerm }));
    };



    const [id, setId] = useState('')

    const handleDownload = (id: number) => {
        socket?.send(JSON.stringify({ action: 'GET_CONTENT', data: id.toString() }));
    };

    console.log(id);

    useEffect(() => {
        if (!id) return
        handleDownload(Number(id))
        setId('');
    }, [buffer, id]);

    console.log(buffer)

    return (
        <div className="container mx-auto p-4">
            <h3 className="text-lg font-bold mb-2">Введите ключевое слово!</h3>
            <form onSubmit={handleSearch} className="mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border p-2 mr-2"
                    placeholder="Ключевое слово"
                    maxLength={16}
                />
                <button type="submit" className="bg-blue-500 text-white p-2">Поиск</button>
            </form>

            <h3 className="text-lg font-bold mb-2">Результат поиска URL на сервере по ключевому слову</h3>
            <div id="divRemote" className="mb-4">
                {urls?.map((url) => (
                    <div key={url.id} className="mb-2">
                        <p>{window.location.href + url.link}</p>
                        <button
                            onClick={() => {
                                setId(url.id.toString())
                            }}
                            className="bg-green-500 text-white p-2"
                        >
                            Скачать контент
                        </button>
                    </div>
                ))}
            </div>

            <h3 className="text-lg font-bold mb-2">Список загруженного контента</h3>
            <div id="divLocal">
                {localContent.map((content, index) => (
                    <div key={index} className="mb-2">
                        <p>{content}</p>
                        <button
                            onClick={() => window.open(content)}
                            className="bg-yellow-500 text-white p-2"
                        >
                            Посмотреть контент
                        </button>
                    </div>
                ))}
            </div>

            <h3></h3>
            <input
                type="button"
                onClick={() => alert("Стол, Стул, Машина")}
                value="Вывести ключевые слова, чтобы не гадать!"
                className="bg-gray-500 text-white p-2"
            />
        </div>
    );
};

export default App;
