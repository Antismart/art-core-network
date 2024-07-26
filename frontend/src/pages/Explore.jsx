import React, { useEffect, useState } from 'react';
import { Box, SimpleGrid, Heading, Input, VStack, useColorModeValue, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import ArtworkCard from '../components/Artwork/ArtworkCard';
import { useArtwork } from '../hooks/useArtwork';

const MotionBox = motion(Box);

const Explore = () => {
  const [artworks, setArtworks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { getAllArtworks, loading, error } = useArtwork();

  useEffect(() => {
    const fetchArtworks = async () => {
      const fetchedArtworks = await getAllArtworks();
      setArtworks(fetchedArtworks);
    };
    fetchArtworks();
  }, [getAllArtworks]);

  const filteredArtworks = artworks.filter(artwork =>
    artwork.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputBgColor = useColorModeValue('gray.100', 'gray.700');
  const inputBorderColor = useColorModeValue('gray.300', 'gray.600');

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Spinner size="xl" />
    </Box>
  );

  if (error) return (
    <Box maxWidth="1200px" margin="auto" py={{ base: 5, md: 10 }} px={{ base: 3, md: 6 }}>
      <Alert status="error">
        <AlertIcon />
        Error: {error}
      </Alert>
    </Box>
  );

  return (
    <Box maxWidth="1200px" margin="auto" py={{ base: 5, md: 10 }} px={{ base: 3, md: 6 }} mt={{ base: 5, md: 10 }}>
      <VStack spacing={8} align="stretch">
        <Heading
          as="h1"
          size="2xl"
          textAlign="center"
          bgClip="text"
          bgGradient="linear(to-r, teal.500, green.500)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Explore Artworks
        </Heading>
        <Input
          placeholder="Search artworks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          bg={inputBgColor}
          borderColor={inputBorderColor}
          focusBorderColor="teal.500"
          size="lg"
          borderRadius="md"
        />
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
          {filteredArtworks.map(artwork => (
            <MotionBox
              key={artwork.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArtworkCard {...artwork} />
            </MotionBox>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default Explore;
