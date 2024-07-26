import React, { useState, useContext } from 'react';
import {
  Box,
  Image,
  Text,
  Heading,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { FaEthereum, FaHistory, FaUserCircle } from 'react-icons/fa';
import { Web3Context } from '../../context/Web3Context';
import { useArtwork } from '../../hooks/useArtwork';

const Artwork = ({ artwork }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [bidAmount, setBidAmount] = useState('');
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const { address, isConnected } = useContext(Web3Context);
  const { placeBid, buyNow } = useArtwork();
  const toast = useToast();

  const handleBid = async () => {
    if (!isConnected) {
      toast({
        title: "Not connected",
        description: "Please connect your wallet to place a bid.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      await placeBid(artwork.id, bidAmount);
      toast({
        title: "Bid placed",
        description: "Your bid has been successfully placed.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error placing your bid.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleBuyNow = async () => {
    if (!isConnected) {
      toast({
        title: "Not connected",
        description: "Please connect your wallet to buy this artwork.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      await buyNow(artwork.id);
      toast({
        title: "Purchase successful",
        description: "You have successfully purchased the artwork.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error purchasing the artwork.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      maxW="md"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      boxShadow="xl"
    >
      <Image src={artwork.imageUrl} alt={artwork.name} />

      <Box p="6">
        <Box d="flex" alignItems="baseline">
          <Badge borderRadius="full" px="2" colorScheme="teal">
            {artwork.category}
          </Badge>
          <Tooltip label={`View ${artwork.artist}'s profile`}>
            <Box
              color="gray.500"
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="xs"
              textTransform="uppercase"
              ml="2"
              cursor="pointer"
            >
              <HStack>
                <FaUserCircle />
                <Text>{artwork.artist}</Text>
              </HStack>
            </Box>
          </Tooltip>
        </Box>

        <Heading mt="1" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
          {artwork.name}
        </Heading>

        <Text color={textColor} fontSize="sm">
          {artwork.description}
        </Text>

        <HStack justifyContent="space-between" mt={4}>
          <VStack align="start">
            <Text fontSize="sm" color={textColor}>
              Current Price
            </Text>
            <HStack>
              <FaEthereum />
              <Text fontWeight="bold" fontSize="lg">
                {artwork.price}
              </Text>
            </HStack>
          </VStack>
          <VStack>
            <Button colorScheme="teal" onClick={handleBuyNow}>Buy Now</Button>
            <Button variant="outline" colorScheme="teal" onClick={onOpen}>Place Bid</Button>
          </VStack>
        </HStack>

        <Box mt={4}>
          <Text fontWeight="bold">Owner: </Text>
          <Text>{artwork.owner}</Text>
        </Box>

        <Box mt={4}>
          <Heading size="sm">Transaction History</Heading>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Event</Th>
                <Th>Price</Th>
                <Th>From</Th>
                <Th>To</Th>
              </Tr>
            </Thead>
            <Tbody>
              {artwork.history.map((transaction, index) => (
                <Tr key={index}>
                  <Td>{transaction.event}</Td>
                  <Td>{transaction.price} ETH</Td>
                  <Td>{transaction.from.slice(0, 6)}...{transaction.from.slice(-4)}</Td>
                  <Td>{transaction.to.slice(0, 6)}...{transaction.to.slice(-4)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Place a Bid</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input 
              placeholder="Enter bid amount in ETH" 
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleBid}>
              Place Bid
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Artwork;