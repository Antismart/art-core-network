import React from 'react';
import { useArtist } from '../hooks/useArtist';
import { Box, Text, Button, VStack } from '@chakra-ui/react';

const ArtistProfile = ({ artistAddress }) => {
  const { profile, loading, error, isCurrentUser, createProfile, updateProfile } = useArtist(artistAddress);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  if (!profile) {
    return (
      <Box>
        <Text>No profile found for this address.</Text>
        {isCurrentUser && (
          <Button onClick={() => createProfile('New Artist', 'My bio')}>Create Profile</Button>
        )}
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="2xl">{profile.name}</Text>
      <Text>{profile.bio}</Text>
      <Text>Artworks: {profile.artworksCount}</Text>
      {isCurrentUser && (
        <Button onClick={() => updateProfile('Updated Name', 'Updated bio')}>Update Profile</Button>
      )}
    </VStack>
  );
};

export default ArtistProfile;