import {type FormEvent, useRef, useState} from "react";
import {Button, Flex, FormControl, Input} from "@chakra-ui/react";
import {useSocketStore} from "@/app/providers";

export const SearchTerms = () => {
    const {socket, setSearchTerm} = useSocketStore();
    const inputRef = useRef<null | HTMLInputElement>(null);
    const [value, setValue] = useState('');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (value === '') return;
        setValue('');
        setSearchTerm(value);
        inputRef.current?.focus();
        socket?.send( {type: 'get_urls', keyword: value});
    };

    return (
        <Flex gap={4} mb={8} as='form' align='center' onSubmit={handleSearch} className="mb-4">
            <FormControl>
                <Input ref={inputRef} type='text' placeholder='Укажите ключевое слово'
                       value={value} onChange={(e) => setValue(e.target.value)}
                />
            </FormControl>
            <Button colorScheme='blue' type="submit">Поиск</Button>
        </Flex>
    )
}