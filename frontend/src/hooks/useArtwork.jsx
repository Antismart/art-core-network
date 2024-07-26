import { useState, useCallback, useContext } from 'react';
import Web3 from 'web3';
import { Web3Context } from '../context/Web3Context';
import ArtworkABI from '../abis/Artwork.json';
import { ARTWORK_CONTRACT_ADDRESS } from '../utils/constants';
import { createArtwork as createArtworkService, getArtwork as getArtworkService } from '../services/web3Service';

export const useArtwork = () => {
  const { web3, accounts } = useContext(Web3Context);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createArtwork = useCallback(async (tokenURI, price) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createArtworkService(tokenURI, price);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const getArtwork = useCallback(async (tokenId) => {
    setLoading(true);
    setError(null);
    try {
      const artwork = await getArtworkService(tokenId);
      setLoading(false);
      return artwork;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const getArtworkContract = useCallback(() => {
    if (!web3) {
      throw new Error("Web3 is not initialized");
    }
    return new web3.eth.Contract(ArtworkABI, ARTWORK_CONTRACT_ADDRESS);
  }, [web3]);

  const getArtistArtworks = useCallback(async (artistAddress) => {
    setLoading(true);
    setError(null);
    try {
      const contract = getArtworkContract();
      const tokenIds = await contract.methods.getArtistArtworks(artistAddress).call();
      const artworks = await Promise.all(tokenIds.map(id => getArtwork(id)));
      setLoading(false);
      return artworks;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [getArtworkContract, getArtwork]);

  return { createArtwork, getArtwork, getArtistArtworks, loading, error };
};