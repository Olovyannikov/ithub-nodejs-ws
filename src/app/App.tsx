import {Container, Text} from "@chakra-ui/react";
import {ActiveWorkers, PageTitle} from "@/entities";
import {SearchTerms} from "@/features";
import {DownloadingProgress, UrlsList} from "@/widgets";
import {ErrorMessage} from "@/entities/ErrorMessage";
import {DownloadedContent} from "@/widgets/DownloadedContent";


const App = () => {
    return (
        <main>
            <section>
                <Container my={8}>
                    <PageTitle as='h1'>Поиск по ключевым словам</PageTitle>
                    <Text mb={8}>(apline, tinycore, slitaz)</Text>
                    <SearchTerms/>
                    <ActiveWorkers/>
                    <UrlsList/>
                    <ErrorMessage/>
                    <DownloadingProgress/>
                    <DownloadedContent/>
                </Container>
            </section>
        </main>
    );
};

export default App;