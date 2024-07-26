import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ChakraProvider, extendTheme, theme as chakraTheme, ColorModeScript } from '@chakra-ui/react';
import { Web3Provider } from './context/Web3Context'; // import Web3Provider
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import reportWebVitals from './reportWebVitals';

const theme = extendTheme(chakraTheme, {
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: chakraTheme.colors,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Router>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Web3Provider>
            <App />
          </Web3Provider>
        </ChakraProvider>
      </Router>
    </ErrorBoundary>
  </React.StrictMode>
);

reportWebVitals();
