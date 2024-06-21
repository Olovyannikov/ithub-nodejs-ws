import {useSocketStore} from "@/app/providers";
import {PageTitle} from "@/entities";
import {Link, ListItem, UnorderedList} from "@chakra-ui/react";
import {LinkIcon} from "@chakra-ui/icons";

export const DownloadedContent = () => {
    const {downloadedContent} = useSocketStore();

    if (!downloadedContent || !downloadedContent.length) return null;

    console.log(downloadedContent)

    return (
        <>
            <PageTitle mb={8}>Загруженный контент:</PageTitle>
            <UnorderedList>
                {downloadedContent?.map((content, index) => (
                    <ListItem key={index}>
                        <Link color='teal.500' isExternal href={`/${content?.split('/').at(-1)}`}
                           download={content?.split('/').at(-1)}>{content?.split('/').at(-1)} <LinkIcon /></Link>
                    </ListItem>
                ))}
            </UnorderedList>
        </>
    )
}