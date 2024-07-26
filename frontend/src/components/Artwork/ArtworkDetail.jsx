import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Image, Heading, Text, Button, VStack, HStack, useToast } from '@chakra-ui/react';
import { useArtwork } from '../hooks/useArtwork';
import { useMarketplace } from '../hooks/useMarketplace';

const ArtworkDetail = () => {
  const { id } = useParams();
  const { getArtwork, loading, error } = useArtwork();
  const { buyArtwork } = useMarketplace();
  const [artwork, setArtwork] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchArtwork = async () => {
      const fetchedArtwork = await getArtwork(id);
      setArtwork(fetchedArtwork);
    };
    fetchArtwork();
  }, [id, getArtwork]);

  const handleBuy = async () => {
    try {
      await buyArtwork(id, artwork.price);
      toast({
        title: 'Purchase successful',
        description: "You've successfully purchased the artwork.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Purchase failed',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) return <Box>Loading...</Box>;
  if (error) return <Box>Error: {error}</Box>;
  if (!artwork) return <Box>Artwork not found</Box>;

  return (
    <Box maxWidth="800px" margin="auto" py={10} px={6}>
      <VStack spacing={8} align="stretch">
        <Image src={artwork.imageUrl} alt={artwork.name} borderRadius="md" />
        <Heading as="h1" size="xl">{artwork.name}</Heading>
        <Text fontSize="lg">{artwork.description}</Text>
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="bold">Price: {artwork.price} CORE</Text>
          <Button colorScheme="teal" onClick={handleBuy}>Buy Now</Button>
        </HStack>
        <Text>Created by: {artwork.artist}</Text>
      </VStack>
    </Box>
  );
};

export default ArtworkDetail;