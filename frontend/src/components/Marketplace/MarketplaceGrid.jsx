import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Select,
  Input,
  VStack,
  HStack,
  Button,
  Text,
  useColorModeValue,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import ArtworkCard from '../Artwork/ArtworkCard';
import { useArtwork } from '../../hooks/useArtwork';
import { useDebounce } from '../../hooks/useDebounce';

const ITEMS_PER_PAGE = 12;

const MarketplaceGrid = () => {
  const [artworks, setArtworks] = useState([]);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');
  const { getAllArtworks, loading, error } = useArtwork();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchArtworks = async () => {
      const fetchedArtworks = await getAllArtworks();
      setArtworks(fetchedArtworks);
      setFilteredArtworks(fetchedArtworks);
    };
    fetchArtworks();
  }, [getAllArtworks]);

  useEffect(() => {
    const results = artworks.filter(artwork =>
      artwork.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) &&
      (category === 'All' || artwork.category === category)
    );

    const sortedResults = results.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'date_asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'date_desc':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredArtworks(sortedResults);
    setCurrentPage(1);
  }, [debouncedSearchTerm, category, sortBy, artworks]);

  const pageCount = Math.ceil(filteredArtworks.length / ITEMS_PER_PAGE);
  const paginatedArtworks = filteredArtworks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <Spinner size="xl" />;
  if (error) return <Text color="red.500">Error: {error}</Text>;

  return (
    <Box bg={bgColor} p={8}>
      <VStack spacing={8} align="stretch">
        <HStack spacing={4} wrap="wrap">
          <Input
            placeholder="Search artworks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            flex={1}
            minW="200px"
          />
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            minW="150px"
          >
            <option value="All">All Categories</option>
            <option value="Painting">Painting</option>
            <option value="Digital">Digital</option>
            <option value="Sculpture">Sculpture</option>
            <option value="Photography">Photography</option>
          </Select>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              Sort By
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setSortBy('date_desc')}>Newest</MenuItem>
              <MenuItem onClick={() => setSortBy('date_asc')}>Oldest</MenuItem>
              <MenuItem onClick={() => setSortBy('price_asc')}>Price: Low to High</MenuItem>
              <MenuItem onClick={() => setSortBy('price_desc')}>Price: High to Low</MenuItem>
            </MenuList>
          </Menu>
        </HStack>

        <SimpleGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
          {paginatedArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </SimpleGrid>

        {pageCount > 1 && (
          <HStack justifyContent="center" spacing={2} mt={8}>
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1}
            >
              Previous
            </Button>
            {[...Array(pageCount)].map((_, i) => (
              <Button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                colorScheme={currentPage === i + 1 ? "teal" : "gray"}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
              isDisabled={currentPage === pageCount}
            >
              Next
            </Button>
          </HStack>
        )}
      </VStack>
    </Box>
  );
};

export default MarketplaceGrid;