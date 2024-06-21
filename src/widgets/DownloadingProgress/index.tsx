import {useSocketStore} from "@/app/providers";
import {Box, ListItem, Progress, UnorderedList} from "@chakra-ui/react";
import {PageTitle} from "@/entities";

export const DownloadingProgress = () => {
    const {downloadProgress} = useSocketStore();

    if (!downloadProgress) return null;

    return (
        <Box py={10}>
            <PageTitle mb={8}>Процесс загрузки:</PageTitle>
            <UnorderedList>
                {Object.entries(downloadProgress).map(([id, progress]) => (
                    <ListItem key={id}>
                        {progress.fileName.split('/').at(-1)}: {progress.progress}%
                        ({progress.downloadedLength}/{progress.contentLength} байтов)
                        <Progress value={Number(progress?.progress)} size='xs' colorScheme='pink'/>
                    </ListItem>
                ))}
            </UnorderedList>
        </Box>
    )
}