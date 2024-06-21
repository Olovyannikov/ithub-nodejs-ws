import {Button, ListItem, Text, UnorderedList} from "@chakra-ui/react";
import {PageTitle} from "@/entities";
import {useSocketStore} from "@/app/providers";

export const UrlsList = () => {
    const {urlList, searchTerm, error, socket} = useSocketStore();

    const downloadContent = (url: string) => {
        socket?.send( {
            type: 'download',
            url
        })
    }

    if (error) {
        return null;
    }

    return (
        <>
            <PageTitle hidden={!urlList?.length} as='h2' mb={8} size='lg'>Результат поиска URL на сервере по ключевому
                слову <i>"{searchTerm}"</i>:</PageTitle>

            <UnorderedList display='grid' gap={12}>
                {urlList?.map((url) => (
                    <ListItem key={url} className="mb-2">
                        <Text>{url}</Text>
                        <Button onClick={() => downloadContent(url)}>Скачать контент</Button>
                    </ListItem>
                ))}
            </UnorderedList></>
    )
};