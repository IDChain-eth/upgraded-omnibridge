import React from "react";
import { HStack, Flex, Box, Text, Image } from "@chakra-ui/core";
// import { Link } from 'react-router-dom';
import Logo from "../assets/footer-logo.svg";
import xDaiLogo from "../assets/xdai.svg";
import TwitterLogo from "../assets/twitter.svg";
import TelegramLogo from "../assets/telegram.svg";
import GithubLogo from "../assets/github.svg";
import RaidGuildLogo from "../assets/raid-guild-logo.svg";

export const Footer = () => {
    return (
        <Flex
            justify="space-between"
            align="center"
            h={20}
            maxW={"75rem"}
            px={4}
            w={"100%"}
            color="grey"
            zIndex={1}
        >
            <Flex justify="space-around" align="center">
                <Image src={Logo} />
            </Flex>
            <HStack spacing={4}>
                <Image src={xDaiLogo} />
                <Image src={TwitterLogo} />
                <Image src={TelegramLogo} />
                <Image src={GithubLogo} />
                <Box w="1px" h="18px" background="grey" />
                <HStack spacing={2}>
                    <Text>Built by</Text>
                    <Image src={RaidGuildLogo} />
                </HStack>
            </HStack>
        </Flex>
    );
};
