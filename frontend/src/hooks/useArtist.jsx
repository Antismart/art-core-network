import { useState, useCallback, useEffect } from 'react';
import { 
  initWeb3,
  getProfile, 
  createArtistProfile, 
  updateArtistProfile,
  followArtist,
  unfollowArtist,
  getCurrentAddress
} from '../services/web3Service';

export const useArtist = (address) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isWeb3Initialized, setIsWeb3Initialized] = useState(false);

  const initializeWeb3 = useCallback(async () => {
    try {
      console.log('Initializing Web3...');
      const initialized = await initWeb3();
      console.log('Web3 initialized:', initialized);
      setIsWeb3Initialized(initialized);
      if (!initialized) {
        setError('Failed to initialize Web3. Please check your MetaMask connection.');
      }
    } catch (err) {
      console.error('Failed to initialize Web3:', err);
      setError('Failed to connect to the blockchain. Please make sure you have MetaMask installed and connected.');
    }
  }, []);

  useEffect(() => {
    initializeWeb3();
  }, [initializeWeb3]);

  const fetchProfile = useCallback(async (artistAddress) => {
    if (!artistAddress || !isWeb3Initialized) {
      console.log('Cannot fetch profile. Address:', artistAddress, 'Web3 Initialized:', isWeb3Initialized);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching profile for address:', artistAddress);
      const fetchedProfile = await getProfile(artistAddress);
      console.log('Fetched profile:', fetchedProfile);
      setProfile(fetchedProfile);
    } catch (err) {
      console.error('Error fetching artist profile:', err);
      setError(err.message || 'Failed to fetch artist profile');
    } finally {
      setLoading(false);
    }
  }, [isWeb3Initialized]);

  useEffect(() => {
    if (address && isWeb3Initialized) {
      fetchProfile(address);
    }
  }, [address, fetchProfile, isWeb3Initialized]);

  useEffect(() => {
    const checkCurrentUser = async () => {
      if (!isWeb3Initialized) return;
      try {
        const currentAddress = await getCurrentAddress();
        setIsCurrentUser(currentAddress.toLowerCase() === address.toLowerCase());
      } catch (err) {
        console.error('Error checking current user:', err);
        setError(err.message || 'Failed to check current user');
      }
    };
    checkCurrentUser();
  }, [address, isWeb3Initialized]);

  const createProfile = useCallback(async (name, bio) => {
    if (!isWeb3Initialized) return;
    setLoading(true);
    setError(null);
    try {
      await createArtistProfile(name, bio);
      await fetchProfile(address);
    } catch (err) {
      console.error('Error creating artist profile:', err);
      setError(err.message || 'Failed to create artist profile');
    } finally {
      setLoading(false);
    }
  }, [address, fetchProfile, isWeb3Initialized]);

  const updateProfile = useCallback(async (name, bio) => {
    if (!isWeb3Initialized) return;
    setLoading(true);
    setError(null);
    try {
      await updateArtistProfile(name, bio);
      await fetchProfile(address);
    } catch (err) {
      console.error('Error updating artist profile:', err);
      setError(err.message || 'Failed to update artist profile');
    } finally {
      setLoading(false);
    }
  }, [address, fetchProfile, isWeb3Initialized]);

  const follow = useCallback(async (artistToFollow) => {
    if (!isWeb3Initialized) return;
    setLoading(true);
    setError(null);
    try {
      await followArtist(artistToFollow);
      await fetchProfile(address);
    } catch (err) {
      console.error('Error following artist:', err);
      setError(err.message || 'Failed to follow artist');
    } finally {
      setLoading(false);
    }
  }, [address, fetchProfile, isWeb3Initialized]);

  const unfollow = useCallback(async (artistToUnfollow) => {
    if (!isWeb3Initialized) return;
    setLoading(true);
    setError(null);
    try {
      await unfollowArtist(artistToUnfollow);
      await fetchProfile(address);
    } catch (err) {
      console.error('Error unfollowing artist:', err);
      setError(err.message || 'Failed to unfollow artist');
    } finally {
      setLoading(false);
    }
  }, [address, fetchProfile, isWeb3Initialized]);

  return {
    profile,
    loading,
    error,
    isCurrentUser,
    createProfile,
    updateProfile,
    follow,
    unfollow,
    refreshProfile: () => fetchProfile(address),
    isWeb3Initialized
  };
};