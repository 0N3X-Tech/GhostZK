import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  makeStyles,
  Theme,
  createStyles,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Box,
  CircularProgress,
  Fade
} from '@material-ui/core';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LockOutlined as LockIcon
} from '@material-ui/icons';

import { unlockWallet } from '../state/wallet/actions';
import { selectIsUnlockingWallet, selectError, selectIsInitialized } from '../state/wallet/selectors';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing(2),
    },
    paper: {
      padding: theme.spacing(4),
      width: '100%',
      maxWidth: 400,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    logo: {
      width: 80,
      height: 80,
      marginBottom: theme.spacing(3),
    },
    title: {
      marginBottom: theme.spacing(1),
      fontWeight: 600,
    },
    subtitle: {
      marginBottom: theme.spacing(3),
      textAlign: 'center',
      opacity: 0.7,
    },
    form: {
      width: '100%',
      marginTop: theme.spacing(1),
    },
    textField: {
      marginBottom: theme.spacing(3),
    },
    submitButton: {
      margin: theme.spacing(3, 0, 2),
      padding: theme.spacing(1.5),
    },
    forgotPassword: {
      textAlign: 'center',
      marginTop: theme.spacing(1),
    },
    errorText: {
      color: theme.palette.error.main,
      textAlign: 'center',
      marginTop: theme.spacing(1),
    },
    lockIcon: {
      fontSize: 24,
      color: theme.palette.primary.main,
      marginBottom: theme.spacing(1),
      backgroundColor: `${theme.palette.primary.main}20`,
      padding: theme.spacing(1.5),
      borderRadius: '50%',
    },
    version: {
      marginTop: theme.spacing(3),
      fontSize: '0.75rem',
      opacity: 0.5,
    },
  })
);

const Unlock: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const isUnlocking = useSelector(selectIsUnlockingWallet);
  const error = useSelector(selectError);
  const isInitialized = useSelector(selectIsInitialized);
  
  // Component state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  
  // Redirect to welcome screen if wallet is not initialized
  useEffect(() => {
    if (!isInitialized) {
      navigate('/welcome');
    }
  }, [isInitialized, navigate]);
  
  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setLocalError('');
  };
  
  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!password) {
      setLocalError('Please enter your password');
      return;
    }
    
    try {
      const success = await dispatch(unlockWallet(password) as any);
      if (success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to unlock wallet:', error);
    }
  };
  
  // Logo placeholder (replace with your actual logo component)
  const LogoPlaceholder = () => (
    <svg 
      width="80" 
      height="80" 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="ghost-logo"
    >
      <circle cx="60" cy="60" r="50" fill="#8A2BE2" opacity="0.2" />
      <path 
        d="M40 40 C 40 30, 80 30, 80 40 L 80 65 C 80 75, 90 80, 90 90 L 30 90 C 30 80, 40 75, 40 65 Z" 
        fill="#8A2BE2" 
      />
      <circle cx="50" cy="55" r="5" fill="white" />
      <circle cx="70" cy="55" r="5" fill="white" />
    </svg>
  );
  
  return (
    <div className={classes.root}>
      <Paper elevation={3} className={classes.paper}>
        <LogoPlaceholder />
        <LockIcon className={classes.lockIcon} />
        
        <Typography variant="h5" className={classes.title}>
          Unlock Wallet
        </Typography>
        
        <Typography variant="body2" className={classes.subtitle}>
          Enter your password to access your wallet
        </Typography>
        
        <form className={classes.form} onSubmit={handleSubmit} noValidate>
          <TextField
            className={classes.textField}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
            error={!!(localError || error)}
            autoFocus
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          {(localError || error) && (
            <Typography variant="body2" className={classes.errorText}>
              {localError || error}
            </Typography>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submitButton}
            disabled={isUnlocking}
          >
            {isUnlocking ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Unlock'
            )}
          </Button>
          
          <Box className={classes.forgotPassword}>
            <Typography variant="body2" color="textSecondary">
              Forgot password? You'll need to restore your wallet using your recovery phrase.
            </Typography>
          </Box>
        </form>
        
        <Typography variant="caption" className={classes.version}>
          GhostZK v0.1.0
        </Typography>
      </Paper>
    </div>
  );
};

export default Unlock;