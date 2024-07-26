import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Header from './components/Layout/Header';
// import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Create from './pages/Create';
import Profile from './pages/Profile';
import { Web3Provider } from './context/Web3Context';

function App() {
  return (
    <Web3Provider>
      <Box minHeight="100vh" display="flex" flexDirection="column">
        <Header />
        <Box flex={1} mt={{ base: 5, md: 10 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/create" element={<Create />} />
            <Route path="/profile/:address" element={<Profile />} />
          </Routes>
        </Box>
        {/* <Footer /> */}
      </Box>
    </Web3Provider>
  );
}

export default App;
