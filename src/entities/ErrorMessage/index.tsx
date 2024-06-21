import {PageTitle} from "@/entities";
import {useSocketStore} from "@/app/providers";

export const ErrorMessage = () => {
    const {error, searchTerm} = useSocketStore();

    if (!error) {
        return null;
    }

    return (
        <PageTitle>По запросу {searchTerm} ничего не найдено :(</PageTitle>
    )
}