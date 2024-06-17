import {URLS} from "../constants";

export async function getURLS(name: string) {
    let urls_data = []
    for (let elem of URLS){
        if (elem.word.toLowerCase() === name.toLowerCase()){
            urls_data.push({'id': elem.id, 'link': '&'+elem.link})
        }
    }
    return urls_data
}

export function getResourceFilename(id: string | number){
    return URLS.find((elem) => elem.id == id)?.link
}