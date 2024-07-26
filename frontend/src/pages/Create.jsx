import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Textarea, VStack, useToast, useColorModeValue } from '@chakra-ui/react';
import { useArtwork } from '../hooks/useArtwork';

const Create = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const { createArtwork, loading, error } = useArtwork();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tokenURI = JSON.stringify({ name, description, image: imageUrl });
      await createArtwork(tokenURI, price);
      toast({
        title: 'Artwork created',
        description: "Your artwork has been successfully created and listed.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setName('');
      setDescription('');
      setImageUrl('');
      setPrice('');
    } catch (err) {
      toast({
        title: 'Error',
        description: error || 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const bgColor = useColorModeValue('#FFFAFA', 'gray.700');
  const inputBgColor = useColorModeValue('gray.100', 'gray.600');
  const buttonColorScheme = useColorModeValue('teal', 'blue');

  return (
    <Box
      maxWidth={{ base: '90%', sm: '500px' }}
      margin="auto"
      py={{ base: 5, md: 10 }}
      px={{ base: 3, md: 6 }}
      bg={bgColor}
      borderRadius="lg"
      boxShadow="lg"
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Artwork Name</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              bg={inputBgColor}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              bg={inputBgColor}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Image URL</FormLabel>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              bg={inputBgColor}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Price (in CORE)</FormLabel>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              bg={inputBgColor}
            />
          </FormControl>
          <Button
            type="submit"
            isLoading={loading}
            colorScheme={buttonColorScheme}
            size="lg"
            width="full"
          >
            Create Artwork
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default Create;
