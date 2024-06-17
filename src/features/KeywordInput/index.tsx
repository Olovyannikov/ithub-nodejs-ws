import {FormEvent, useState} from 'react';
import {Socket} from 'socket.io-client';

interface KeywordInputProps {
    socket: Socket;
}

export const KeywordInput = ({socket}: KeywordInputProps) => {
    const [keyword, setKeyword] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        socket.emit('request_urls', keyword);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Введите ключевое слово"
                className="border p-2"
            />
            <button type="submit" className="bg-blue-500 text-white p-2">Отправить</button>
        </form>
    );
};
