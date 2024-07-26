import Web3 from 'web3';
import ArtistProfileABI from "../../src/abis/ArtistProfile.json";
import ArtworkABI from '../abis/Artwork.json';
import MarketplaceABI from '../abis/Marketplace.json';

const ARTIST_PROFILE_ADDRESS = '0x0262Cf4Ec6CB23a634B577D1fC37A6D5fD87A6a6';
const ARTWORK_ADDRESS = '0x0773e4a8aC3078371cB46c66A545E8Ba7F1f085c';
const MARKETPLACE_ADDRESS = '0x259c302c3e36B0c402b5216a9ce4FF044FB00d5A';
const CORE_TESTNET_CHAIN_ID = 1115;
const artistAbi = ArtistProfileABI.abi;
const artAbi = ArtworkABI.abi;
const marketAbi = MarketplaceABI.abi

let web3;
let accounts;
let artistProfileContract;
let artworkContract;
let marketplaceContract;
let isInitialized = false;

export const initWeb3 = async () => {
  console.log('initWeb3 called');

  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);

      const chainId = await web3.eth.getChainId();
      if (chainId !== CORE_TESTNET_CHAIN_ID) {
        await switchToCorrectNetwork();
      }

      accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();

      artistProfileContract = new web3.eth.Contract(artistAbi, ARTIST_PROFILE_ADDRESS);
      console.log('Reinitialize Contract Methods:', Object.keys(artistProfileContract.methods));

      try {
        const result = await artistProfileContract.methods.getProfile(accounts[0]).call();
        console.log('getProfile result:', result);
      } catch (error) {
        console.error('Error calling getProfile:', error);
      }

      artworkContract = new web3.eth.Contract(artAbi, ARTWORK_ADDRESS);
      marketplaceContract = new web3.eth.Contract(marketAbi, MARKETPLACE_ADDRESS);

      isInitialized = true;
      console.log('Web3 initialized successfully');
      return { web3, accounts, networkId, isConnected: true };
    } catch (error) {
      console.error("Error initializing Web3:", error);
      throw error;
    }
  } else {
    console.error('No web3 detected. Please install MetaMask.');
    throw new Error('No web3 detected');
  }
};

const switchToCorrectNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: web3.utils.toHex(CORE_TESTNET_CHAIN_ID) }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: web3.utils.toHex(CORE_TESTNET_CHAIN_ID),
            chainName: 'Core Testnet',
            nativeCurrency: {
              name: 'Core',
              symbol: 'tCORE',
              decimals: 18
            },
            rpcUrls: ['https://rpc.test.btcs.network'],
            blockExplorerUrls: ['https://scan.test.btcs.network']
          }],
        });
      } catch (addError) {
        console.error("Failed to add Core Testnet to wallet");
        throw addError;
      }
    } else {
      console.error("Failed to switch to Core Testnet");
      throw switchError;
    }
  }
};

const ensureInitialized = async () => {
  if (!isInitialized) {
    await initWeb3();
  }
};


export const inspectContractMethods = () => {
  if (!artistProfileContract) {
    console.error('artist Profile Contract not initialized');
    return;
  }

  console.log('Available methods in Artist Profile:');
  Object.keys(artistProfileContract.methods).forEach(methodName => {
    if (typeof artistProfileContract.methods[methodName] === 'function') {
      console.log(methodName);
    }
  });
}
// Artist Profile functions
export const getProfile = async (artistAddress) => {
  await ensureInitialized();
  console.log('getArtistProfile called with address:', artistAddress);
  
  try {
    inspectContractMethods();

    if (typeof artistProfileContract.methods.getProfile !== 'function') {
      console.error('getProfile method not found in contract ABI');
      throw new Error('Contract method not found');
    }

    const profile = await artistProfileContract.methods.getProfile(artistAddress).call();
    console.log('Raw profile data:', profile);

    if (!profile || profile.name === '') {
      console.error('Artist profile not found');
      throw new Error('Artist profile not found');
    }

    return {
      name: profile[0],
      bio: profile[1],
      walletAddress: profile[2],
      followerCount: parseInt(profile[3]),
      followingCount: parseInt(profile[4]),
      isVerified: profile[5],
    };
  } catch (error) {
    console.error("Error getting artist profile:", error);
    throw error;
  }
  
};

export const createArtistProfile = async (name, bio) => {
  await ensureInitialized();
  try {
    const tx = await artistProfileContract.methods.createProfile(name, bio).send({ from: accounts[0] });
    return tx.transactionHash;
  } catch (error) {
    console.error("Error creating artist profile:", error);
    throw error;
  }
};

export const updateArtistProfile = async (name, bio) => {
  await ensureInitialized();
  try {
    const tx = await artistProfileContract.methods.updateProfile(name, bio).send({ from: accounts[0] });
    return tx.transactionHash;
  } catch (error) {
    console.error("Error updating artist profile:", error);
    throw error;
  }
};

export const followArtist = async (artistAddress) => {
  await ensureInitialized();
  try {
    const tx = await artistProfileContract.methods.followArtist(artistAddress).send({ from: accounts[0] });
    return tx.transactionHash;
  } catch (error) {
    console.error("Error following artist:", error);
    throw error;
  }
};

export const unfollowArtist = async (artistAddress) => {
  await ensureInitialized();
  try {
    const tx = await artistProfileContract.methods.unfollowArtist(artistAddress).send({ from: accounts[0] });
    return tx.transactionHash;
  } catch (error) {
    console.error("Error unfollowing artist:", error);
    throw error;
  }
};

export const isFollowingArtist = async (followerAddress, artistAddress) => {
  await ensureInitialized();
  try {
    return await artistProfileContract.methods.isFollowing(followerAddress, artistAddress).call();
  } catch (error) {
    console.error("Error checking if following artist:", error);
    throw error;
  }
};

// Artwork functions
export const createArtwork = async (tokenURI, price) => {
  await ensureInitialized();
  try {
    const tx = await artworkContract.methods.createToken(tokenURI).send({ from: accounts[0] });
    const tokenId = await artworkContract.methods.getLatestTokenId().call();
    await listArtworkForSale(tokenId, web3.utils.toWei(price.toString(), 'ether'));
    return tokenId;
  } catch (error) {
    console.error("Error creating artwork:", error);
    throw error;
  }
};

export const getArtwork = async (tokenId) => {
  await ensureInitialized();
  try {
    const artwork = await artworkContract.methods.getArtwork(tokenId).call();
    const tokenURI = await artworkContract.methods.tokenURI(tokenId).call();
    const metadata = await fetch(tokenURI).then(res => res.json());
    return {
      id: tokenId,
      name: metadata.name,
      description: metadata.description,
      imageUrl: metadata.image,
      artist: artwork.artist,
      owner: artwork.owner,
      price: web3.utils.fromWei(artwork.price, 'ether'),
    };
  } catch (error) {
    console.error("Error getting artwork:", error);
    throw error;
  }
};

export const getArtistArtworks = async (artistAddress) => {
  await ensureInitialized();
  try {
    const tokenIds = await artworkContract.methods.getArtistArtworks(artistAddress).call();
    const artworks = await Promise.all(tokenIds.map(id => getArtwork(id)));
    return artworks;
  } catch (error) {
    console.error("Error getting artist artworks:", error);
    throw error;
  }
};

// Marketplace functions
export const listArtworkForSale = async (tokenId, price) => {
  await ensureInitialized();
  try {
    const tx = await marketplaceContract.methods.listArtwork(tokenId, price).send({ from: accounts[0] });
    return tx.transactionHash;
  } catch (error) {
    console.error("Error listing artwork for sale:", error);
    throw error;
  }
};

export const buyArtwork = async (tokenId, price) => {
  await ensureInitialized();
  try {
    const tx = await marketplaceContract.methods.buyArtwork(tokenId).send({ from: accounts[0], value: price });
    return tx.transactionHash;
  } catch (error) {
    console.error("Error buying artwork:", error);
    throw error;
  }
};

export const getAllArtworks = async () => {
  await ensureInitialized();
  try {
    const artworkCount = await artworkContract.methods.totalSupply().call();
    const artworks = [];
    for (let i = 1; i <= artworkCount; i++) {
      const artwork = await getArtwork(i);
      artworks.push(artwork);
    }
    return artworks;
  } catch (error) {
    console.error("Error getting all artworks:", error);
    throw error;
  }
};

// Utility functions
export const getBalance = async (address) => {
  await ensureInitialized();
  try {
    const balance = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balance, 'ether');
  } catch (error) {
    console.error("Error getting balance:", error);
    throw error;
  }
};

export const getCurrentAddress = async () => {
  await ensureInitialized();
  try {
    return accounts[0];
  } catch (error) {
    console.error("Error getting current address:", error);
    throw error;
  }
};

export const subscribeToEvents = (eventName, callback) => {
  if (!isInitialized) {
    console.error("Web3 not initialized. Please connect first.");
    return;
  }

  let contract;
  switch (eventName) {
    case 'ProfileCreated':
    case 'ProfileUpdated':
    case 'Followed':
    case 'Unfollowed':
    case 'ProfileVerified':
      contract = artistProfileContract;
      break;
    case 'ArtworkCreated':
    case 'ArtworkTransferred':
      contract = artworkContract;
      break;
    case 'ArtworkListed':
    case 'ArtworkSold':
      contract = marketplaceContract;
      break;
    default:
      console.error("Unknown event name");
      return;
  }

  contract.events[eventName]({}, (error, event) => {
    if (error) {
      console.error(`Error on ${eventName} event:`, error);
    } else {
      callback(event.returnValues);
    }
  });
};

export const estimateGas = async (method, ...args) => {
  await ensureInitialized();
  try {
    const gasEstimate = await method(...args).estimateGas({ from: accounts[0] });
    return gasEstimate;
  } catch (error) {
    console.error("Error estimating gas:", error);
    throw error;
  }
};

export const getNetworkInfo = async () => {
  await ensureInitialized();
  try {
    const networkId = await web3.eth.net.getId();
    const networkType = await web3.eth.net.getNetworkType();
    return { networkId, networkType };
  } catch (error) {
    console.error("Error getting network info:", error);
    throw error;
  }
};