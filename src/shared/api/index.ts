interface URLItem {
    id: number;
    word: string;
    link: string;
}

const URL_DICT: URLItem[] = [
    { id: 0, word: "Стол", link: '1.jpg' },
    { id: 1, word: "Стол", link: '2.jpg' },
];

export async function getURLS(searchWord: string): Promise<{id: number, link: string}[]> {
    return URL_DICT.filter(elem => elem.word.toLowerCase() === searchWord.toLowerCase())
        .map(elem => ({id: elem.id, link: elem.link}));
}

export function getResourceFilename(id: number | string): string {
    const item = URL_DICT.find(elem => Number(elem.id) === Number(id));
    if (!item) throw new Error(`Resource with id ${id} not found`);
    return item.link;
}
