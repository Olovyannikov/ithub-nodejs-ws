import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const socket = io('http://localhost:443', {
    path: '/wss'
});

const App: React.FC = () => {
    const [urls, setUrls] = useState<string[]>([]);
    const [resourceUrl, setResourceUrl] = useState<string | null>(null);

    useEffect(() => {
        socket.on('message', (message: string) => {
            const msg = JSON.parse(message);

            if (msg.type === 'links') {
                setUrls(msg.links);
            } else if (msg.type === 'resource') {
                setResourceUrl(msg.url);
            }
        });

        return () => {
            socket.off('message');
        };
    }, []);

    const requestUrls = () => {
        const requestId = uuidv4();
        socket.send(JSON.stringify({ type: 'urls', id: requestId }));
    };

    const requestResource = (url: string) => {
        const requestId = uuidv4();
        socket.send(JSON.stringify({ type: 'resource', id: requestId, name: url }));
    };

    return (
        <div className="container mx-auto text-center p-4">
            <h1 className="text-2xl font-bold mb-4">URL Downloader</h1>
            <button
                className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
                onClick={requestUrls}
            >
                Request URLs
            </button>

            <div className="mb-4">
                {urls.map((url, index) => (
                    <div key={index} className="mb-2">
            <span className="text-blue-600 cursor-pointer" onClick={() => requestResource(url)}>
              {url}
            </span>
                    </div>
                ))}
            </div>

            {resourceUrl && (
                <div className="mt-4">
                    <h2 className="text-xl font-bold">Resource</h2>
                    <a href={resourceUrl} className="text-blue-600" download>
                        Download Resource
                    </a>
                </div>
            )}
        </div>
    );
};

export default App;