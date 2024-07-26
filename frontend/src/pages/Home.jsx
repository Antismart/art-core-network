import React from 'react';
import { Box, Heading, Text, Button, VStack, Image } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Home = () => {
  return (
    <Box position="relative" height="100vh" width="100vw" overflow="hidden">
      <Image 
        src="/pikaso_enhance__vivid_2K_Art_r_c_.png" 
        alt="Digital Art" 
        objectFit="cover" 
        width="100%" 
        height="100%" 
      />
      <VStack 
        spacing={8} 
        align="center" 
        position="absolute" 
        top="50%" 
        left="50%" 
        transform="translate(-50%, -50%)" 
        color="white" 
        textAlign="center" 
        p={4}
        bg="rgba(0, 0, 0, 0.5)"  
        borderRadius="md"
        width={{ base: '90%', md: 'auto' }}
      >
        <Heading as="h1" size={{ base: 'xl', md: '2xl' }}>
          Welcome to Art Core Network
        </Heading>
        <Text fontSize={{ base: 'md', md: 'xl' }}>
          Discover, create, and trade unique digital artworks on the Core Chain.
        </Text>
        <Button as={RouterLink} to="/explore" size={{ base: 'md', md: 'lg' }} colorScheme="teal">
          Explore Artworks
        </Button>
      </VStack>
    </Box>
  );
};

export default Home;
