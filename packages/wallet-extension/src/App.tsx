import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@material-ui/core';
import { selectIsInitialized, selectIsUnlocked } from './state/wallet/selectors';
import { initializeWallet } from './state/wallet/actions';
import LoadingScreen from './components/LoadingScreen';

// Pages
import Welcome from './pages/Welcome';
import CreateWallet from './pages/CreateWallet';
import ImportWallet from './pages/ImportWallet';
import Dashboard from './pages/Dashboard';
import Send from './pages/Send';
import Receive from './pages/Receive';
import Settings from './pages/Settings';
import Unlock from './pages/Unlock';
import ConnectDApp from './pages/ConnectDApp';
import TransactionConfirm from './pages/TransactionConfirm';
import AccountDetails from './pages/AccountDetails';

// Define the theme
const theme = createTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#8A2BE2', // Purple shade
    },
    secondary: {
      main: '#00BFFF', // Light blue
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.2rem',
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 8,
        padding: '10px 24px',
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiPaper: {
      rounded: {
        borderRadius: 12,
      },
    },
  },
});

// AuthGuard component to protect routes that require authentication
const AuthGuard: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const isUnlocked = useSelector(selectIsUnlocked);
  const isInitialized = useSelector(selectIsInitialized);
  
  if (!isInitialized) {
    return <Navigate to="/welcome" replace />;
  }
  
  if (!isUnlocked) {
    return <Navigate to="/unlock" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useSelector(selectIsInitialized);

  useEffect(() => {
    const initWallet = async () => {
      try {
        await dispatch(initializeWallet() as any);
      } catch (error) {
        console.error('Failed to initialize wallet:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initWallet();
  }, [dispatch]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/welcome" element={!isInitialized ? <Welcome /> : <Navigate to="/" replace />} />
          <Route path="/create" element={<CreateWallet />} />
          <Route path="/import" element={<ImportWallet />} />
          <Route path="/unlock" element={<Unlock />} />

          {/* Protected routes */}
          <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/send" element={<AuthGuard><Send /></AuthGuard>} />
          <Route path="/receive" element={<AuthGuard><Receive /></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
          <Route path="/account/:id" element={<AuthGuard><AccountDetails /></AuthGuard>} />
          
          {/* DApp connection routes */}
          <Route path="/connect" element={<ConnectDApp />} />
          <Route path="/confirm-transaction" element={<AuthGuard><TransactionConfirm /></AuthGuard>} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;