import React, { useContext, useEffect, useState } from 'react';
import { Box, Flex, Button, Heading, useColorMode, useColorModeValue, Tooltip, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { Web3Context } from '../../context/Web3Context';

const CORE_TESTNET_CHAIN_ID = 1115n;

const Header = () => {
  const { isConnected, address, connect, networkId, switchNetwork } = useContext(Web3Context);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const { toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('#FAFAD2', 'gray.800');
  const gradientBg = useColorModeValue(
    'linear(to-r, teal.500, green.500)',
    'linear(to-r, teal.200, green.200)'
  );

  useEffect(() => {
    console.log('Header isConnected:', isConnected);
    console.log('Header address:', address);
    console.log('Current network ID:', networkId);
    console.log('Is correct network:', networkId === CORE_TESTNET_CHAIN_ID);
  }, [isConnected, address, networkId]);

  const handleConnect = async () => {
    if (isConnected) {
      navigate(`/profile/${address}`);
    } else {
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
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchNetwork(CORE_TESTNET_CHAIN_ID);
    } catch (err) {
      console.error('Network switch error:', err);
      setError('Failed to switch network. Please try manually in your wallet.');
    }
  };

  const isCorrectNetwork = networkId === CORE_TESTNET_CHAIN_ID;

  const getWalletButtonText = () => {
    if (isConnecting) return 'Connecting...';
    if (isConnected) return `${address.slice(0, 6)}...${address.slice(-4)}`;
    return 'Connect Wallet';
  };

  return (
    <Box bg={bgColor} px={4} position="fixed" width="100%" zIndex={1}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <Heading as="h1" size="lg">
          <Link to="/">
            <img src="isolated-layout.svg" alt="Art Core Network Logo" style={{ height: '240px', width: 'auto' }} />
          </Link>
        </Heading>
        <Flex alignItems={'center'}>
          <Link to="/explore">
            <Button variant="ghost" mr={3}>
              Explore
            </Button>
          </Link>
          <Link to="/create">
            <Button variant="ghost" mr={3}>
              Create
            </Button>
          </Link>
          <Button onClick={toggleColorMode} mr={3}>
            Toggle Theme
          </Button>
          <Tooltip label={isConnected ? 'View your profile' : 'Connect your wallet'}>
            <Button
              bgGradient={gradientBg}
              color="white"
              onClick={handleConnect}
              isLoading={isConnecting}
            >
              {getWalletButtonText()}
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}
      {isConnected && !isCorrectNetwork && (
        <Alert status="warning">
          <AlertIcon />
          <Text mr={2}>Wrong Network. Please switch to Core Testnet.</Text>
          <Button size="sm" onClick={handleSwitchNetwork}>
            Switch to Core Testnet
          </Button>
        </Alert>
      )}
    </Box>
  );
};

export default Header;
