interface DownloadedContentProps {
    content: string;
}

export const DownloadedContent = ({content}: DownloadedContentProps) => {
    return (
        <div>
            <h2>Содержимое:</h2>
            <pre>{content}</pre>
        </div>
    );
};
