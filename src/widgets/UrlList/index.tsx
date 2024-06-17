interface UrlListProps {
    urls: string[];
    onSelect: (url: string) => void;
}

export const UrlList = ({ urls, onSelect }:UrlListProps) => {
    return (
        <ul>
            {urls.map((url) => (
                <li key={url} onClick={() => onSelect(url)} className="cursor-pointer p-2 border-b">
                    {url}
                </li>
            ))}
        </ul>
    );
};
