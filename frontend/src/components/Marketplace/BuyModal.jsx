// src/components/Marketplace/BuyModal.js

import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Image,
  VStack,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { buyArtwork } from '../../services/web3Service';

const { ethers } = require("ethers");

const BuyModal = ({ isOpen, onClose, artwork }) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const price = ethers.utils.parseEther(artwork.price);
      const tx = await buyArtwork(artwork.id, price);
      
      toast({
        title: 'Purchase Successful',
        description: `Transaction hash: ${tx}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!artwork) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirm Purchase</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Image src={artwork.imageUrl} alt={artwork.name} borderRadius="md" />
            <Text fontWeight="bold" fontSize="xl">{artwork.name}</Text>
            <Text>by {artwork.artist}</Text>
            <HStack justifyContent="space-between">
              <Text>Price:</Text>
              <Text fontWeight="bold">{artwork.price} CORE</Text>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              Please confirm that you want to purchase this artwork. The transaction cannot be undone once it's processed.
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="teal" 
            onClick={handlePurchase} 
            isLoading={isLoading}
            loadingText="Processing"
          >
            Confirm Purchase
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BuyModal;