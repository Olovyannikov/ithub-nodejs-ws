import {Heading, HeadingProps} from "@chakra-ui/react";
import type {PropsWithChildren} from "react";
import {memo} from "react";

export const PageTitle = memo(({children, ...props}: PropsWithChildren<HeadingProps>) => {
    return (
        <>
            <Heading {...props}>{children}</Heading>
        </>
    )
})