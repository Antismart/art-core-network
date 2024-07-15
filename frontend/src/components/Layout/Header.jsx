import React, { useContext, useEffect, useState } from 'react';
import { Box, Flex, Button, Heading, useColorMode, useColorModeValue, Tooltip, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Web3Context } from '../../context/Web3Context';

const Header = () => {
  const { isConnected, address, connect, networkId } = useContext(Web3Context);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const { toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('#FAFAD2', 'gray.800');
  const gradientBg = useColorModeValue(
    'linear(to-r, teal.500, green.500)',
    'linear(to-r, teal.200, green.200)'
  );

  useEffect(() => {
    console.log('Header isConnected:', isConnected);
    console.log('Header address:', address);
  }, [isConnected, address]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await connect();
    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const isCorrectNetwork = networkId === 1; // Assuming Mainnet, change as needed

  const getWalletButtonText = () => {
    if (isConnecting) return 'Connecting...';
    if (isConnected) return `${address.slice(0, 6)}...${address.slice(-4)}`;
    return 'Connect Wallet';
  };

  return (
    <Box bg={bgColor} px={4} boxShadow="md">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Heading as="h1" size="lg" bgClip="text" bgGradient={gradientBg}>
          <Link to="/">Art Core Network</Link>
        </Heading>
        <Flex alignItems="center">
          <Link to="/explore">
            <Button variant="ghost" mr={3} _hover={{ bg: "teal.500", color: "white" }}>
              Explore
            </Button>
          </Link>
          <Link to="/create">
            <Button variant="ghost" mr={3} _hover={{ bg: "teal.500", color: "white" }}>
              Create
            </Button>
          </Link>
          <Button onClick={toggleColorMode} mr={3} _hover={{ bg: "teal.500", color: "white" }}>
            Toggle Theme
          </Button>
          <Tooltip label={isConnected ? address : 'Connect your wallet'} fontSize="md">
            <Button 
              onClick={isConnected ? undefined : handleConnect} 
              as={isConnected ? Link : undefined}
              to={isConnected ? `/profile/${address}` : undefined}
              bg="teal.500" 
              color="white" 
              _hover={{ bg: "teal.600" }}
              isLoading={isConnecting}
              loadingText="Connecting"
            >
              {getWalletButtonText()}
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
      {error && <Text color="red.500">{error}</Text>}
      {isConnected && !isCorrectNetwork && (
        <Text color="red.500" textAlign="center" py={2}>Wrong Network. Please switch to Ethereum Mainnet.</Text>
      )}
    </Box>
  );
};

export default Header;