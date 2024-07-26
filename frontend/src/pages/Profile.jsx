import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading, Text, VStack, Button, Input, Spinner } from '@chakra-ui/react';
import { useArtist } from '../hooks/useArtist';

const Profile = () => {
  const { address } = useParams();
  const { 
    profile, 
    loading, 
    error, 
    isCurrentUser,
    createProfile,
    updateProfile,
    follow,
    unfollow,
    isWeb3Initialized,
    refreshProfile
  } = useArtist(address);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    console.log('Profile component rendered. Address:', address);
    console.log('Is Web3 Initialized:', isWeb3Initialized);
    console.log('Loading:', loading);
    console.log('Error:', error);
    console.log('Profile:', profile);
  }, [address, isWeb3Initialized, loading, error, profile]);

  if (!isWeb3Initialized) {
    return <Box>Connecting to blockchain...</Box>;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text>Error: {error}</Text>
        <Button onClick={refreshProfile}>Retry</Button>
      </Box>
    );
  }

  const handleCreateProfile = () => {
    createProfile(name, bio);
  };

  const handleUpdateProfile = () => {
    updateProfile(name, bio);
  };

  const handleFollow = () => {
    follow(address);
  };

  const handleUnfollow = () => {
    unfollow(address);
  };

  return (
    <Box maxWidth="800px" margin="auto" py={10} px={6}>
      <VStack spacing={8} align="stretch">
        {profile ? (
          <>
            <Heading as="h1" size={{ base: 'lg', md: 'xl' }}>{profile.name}</Heading>
            <Text>{profile.bio}</Text>
            <Text>Followers: {profile.followerCount}</Text>
            <Text>Following: {profile.followingCount}</Text>
            <Text>{profile.isVerified ? 'Verified' : 'Not Verified'}</Text>
            {isCurrentUser ? (
              <>
                <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
                <Button onClick={handleUpdateProfile}>Update Profile</Button>
              </>
            ) : (
              <Button onClick={handleFollow}>Follow</Button>
            )}
          </>
        ) : (
          <>
            <Heading as="h1" size={{ base: 'lg', md: 'xl' }}>Create Profile</Heading>
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
            <Button onClick={handleCreateProfile}>Create Profile</Button>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default Profile;
