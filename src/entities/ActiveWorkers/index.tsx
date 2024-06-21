import {PageTitle} from "@/entities";
import {useSocketStore} from "@/app/providers";
import {Badge} from "@chakra-ui/react";

export const ActiveWorkers = () => {
    const {workerCount} = useSocketStore();

    return (
        <PageTitle pos='fixed' bottom={4} left={4} size='sm'>
            <Badge p={4} borderRadius={12}>Активные потоки: {workerCount?.activeWorkers} / {workerCount?.maxWorkers}</Badge>
        </PageTitle>
    )
}