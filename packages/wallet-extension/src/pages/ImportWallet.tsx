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
  Divider,
  Box,
  CircularProgress,
  FormHelperText,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Fade,
  Chip
} from '@material-ui/core';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@material-ui/icons';
import { importWallet } from '../state/wallet/actions';
import { selectIsImportingWallet, selectError } from '../state/wallet/selectors';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.background.default,
    },
    header: {
      padding: theme.spacing(2),
      display: 'flex',
      alignItems: 'center',
    },
    backButton: {
      marginRight: theme.spacing(1),
    },
    content: {
      flex: 1,
      padding: theme.spacing(2),
      overflowY: 'auto',
    },
    paper: {
      padding: theme.spacing(3),
      marginBottom: theme.spacing(2),
    },
    title: {
      fontWeight: 600,
      marginBottom: theme.spacing(1),
    },
    subtitle: {
      marginBottom: theme.spacing(3),
      opacity: 0.7,
    },
    formField: {
      marginBottom: theme.spacing(3),
    },
    mnemonicInput: {
      marginBottom: theme.spacing(3),
    },
    actions: {
      marginTop: theme.spacing(3),
      display: 'flex',
      justifyContent: 'flex-end',
    },
    errorText: {
      color: theme.palette.error.main,
      marginTop: theme.spacing(1),
    },
    passwordRequirements: {
      marginTop: theme.spacing(1),
      fontSize: '0.75rem',
    },
    requirementItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(0.5),
      '& svg': {
        fontSize: '0.875rem',
        marginRight: theme.spacing(0.5),
      },
    },
    validRequirement: {
      color: theme.palette.success.main,
    },
    invalidRequirement: {
      color: theme.palette.text.secondary,
    },
    warningBox: {
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
      border: '1px solid rgba(255, 152, 0, 0.5)',
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2),
      marginBottom: theme.spacing(3),
      display: 'flex',
      alignItems: 'flex-start',
    },
    warningIcon: {
      color: theme.palette.warning.main,
      marginRight: theme.spacing(1),
      marginTop: theme.spacing(0.5),
    },
    wordChips: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: theme.spacing(1),
      marginTop: theme.spacing(1),
    },
    wordChip: {
      marginBottom: theme.spacing(1),
    },
    inputContainer: {
      position: 'relative',
      marginBottom: theme.spacing(4),
    },
  })
);

const ImportWallet: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const isImporting = useSelector(selectIsImportingWallet);
  const error = useSelector(selectError);
  
  // Component state
  const [mnemonic, setMnemonic] = useState('');
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mnemonicError, setMnemonicError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isValid, setIsValid] = useState(false);
  
  // Password requirements
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword;
  
  // Validate mnemonic
  const isMnemonicValid = mnemonicWords.length === 24;
  
  // Update mnemonic words when text changes
  useEffect(() => {
    const words = mnemonic.trim().split(/\s+/).filter(word => word !== '');
    setMnemonicWords(words);
    setMnemonicError('');
  }, [mnemonic]);
  
  // Validate form
  useEffect(() => {
    setIsValid(
      isMnemonicValid && 
      hasMinLength && 
      hasUppercase && 
      hasLowercase && 
      hasNumber && 
      hasSpecial && 
      passwordsMatch
    );
  }, [
    isMnemonicValid,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    passwordsMatch
  ]);
  
  // Handle password field changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError('');
  };
  
  // Handle confirm password field changes
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setPasswordError('');
  };
  
  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Handle mnemonic field changes
  const handleMnemonicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMnemonic(e.target.value);
  };
  
  // Go back to welcome screen
  const handleBack = () => {
    navigate('/welcome');
  };
  
  // Import the wallet
  const handleImport = async () => {
    if (!isValid) {
      if (!isMnemonicValid) {
        setMnemonicError('Please enter a valid 24-word recovery phrase');
      }
      if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        setPasswordError('Please ensure your password meets all requirements');
      }
      if (!passwordsMatch) {
        setPasswordError('Passwords do not match');
      }
      return;
    }
    
    try {
      await dispatch(importWallet(mnemonicWords.join(' '), password) as any);
      navigate('/');
    } catch (error) {
      console.error('Failed to import wallet:', error);
    }
  };
  
  // Render password requirements
  const renderPasswordRequirements = () => (
    <div className={classes.passwordRequirements}>
      <div className={`${classes.requirementItem} ${hasMinLength ? classes.validRequirement : classes.invalidRequirement}`}>
        {hasMinLength ? <CheckCircleIcon /> : <WarningIcon />}
        <Typography variant="caption">At least 8 characters</Typography>
      </div>
      <div className={`${classes.requirementItem} ${hasUppercase ? classes.validRequirement : classes.invalidRequirement}`}>
        {hasUppercase ? <CheckCircleIcon /> : <WarningIcon />}
        <Typography variant="caption">At least 1 uppercase letter</Typography>
      </div>
      <div className={`${classes.requirementItem} ${hasLowercase ? classes.validRequirement : classes.invalidRequirement}`}>
        {hasLowercase ? <CheckCircleIcon /> : <WarningIcon />}
        <Typography variant="caption">At least 1 lowercase letter</Typography>
      </div>
      <div className={`${classes.requirementItem} ${hasNumber ? classes.validRequirement : classes.invalidRequirement}`}>
        {hasNumber ? <CheckCircleIcon /> : <WarningIcon />}
        <Typography variant="caption">At least 1 number</Typography>
      </div>
      <div className={`${classes.requirementItem} ${hasSpecial ? classes.validRequirement : classes.invalidRequirement}`}>
        {hasSpecial ? <CheckCircleIcon /> : <WarningIcon />}
        <Typography variant="caption">At least 1 special character</Typography>
      </div>
      <div className={`${classes.requirementItem} ${passwordsMatch ? classes.validRequirement : classes.invalidRequirement}`}>
        {passwordsMatch ? <CheckCircleIcon /> : <WarningIcon />}
        <Typography variant="caption">Passwords match</Typography>
      </div>
    </div>
  );
  
  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <IconButton 
          edge="start" 
          className={classes.backButton} 
          onClick={handleBack}
          aria-label="back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Import Wallet</Typography>
      </div>
      
      <div className={classes.content}>
        <Paper className={classes.paper}>
          <Typography variant="h6" className={classes.title}>Recovery Phrase</Typography>
          <Typography variant="body2" className={classes.subtitle}>
            Enter your 24-word recovery phrase to restore your wallet.
          </Typography>
          
          <div className={classes.warningBox}>
            <WarningIcon className={classes.warningIcon} />
            <div>
              <Typography variant="body2" gutterBottom>
                <strong>Important:</strong> Never share your recovery phrase with anyone.
              </Typography>
              <Typography variant="body2">
                Be sure you're on the correct website. Verify the URL: extension.ghostzk.com
              </Typography>
            </div>
          </div>
          
          <div className={classes.inputContainer}>
            <TextField
              className={classes.mnemonicInput}
              label="Recovery Phrase"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={mnemonic}
              onChange={handleMnemonicChange}
              placeholder="Enter your 24-word recovery phrase, separated by spaces"
              error={!!mnemonicError}
              helperText={mnemonicError || 'Enter all 24 words in the correct order, separated by spaces'}
            />
            
            {mnemonicWords.length > 0 && (
              <Box className={classes.wordChips}>
                {mnemonicWords.map((word, index) => (
                  <Chip
                    key={index}
                    label={`${index + 1}: ${word}`}
                    className={classes.wordChip}
                    variant="outlined"
                    size="small"
                  />
                ))}
                {mnemonicWords.length !== 24 && (
                  <Chip
                    label={`${mnemonicWords.length}/24 words`}
                    color={mnemonicWords.length === 24 ? "primary" : "default"}
                    size="small"
                  />
                )}
              </Box>
            )}
          </div>
          
          <Typography variant="h6" className={classes.title}>Create Password</Typography>
          <Typography variant="body2" className={classes.subtitle}>
            Create a strong password to secure your wallet. You'll need this password to unlock your wallet.
          </Typography>
          
          <FormControl variant="outlined" fullWidth className={classes.formField}>
            <InputLabel htmlFor="password">Password</InputLabel>
            <OutlinedInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              error={!!passwordError}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              }
              labelWidth={70}
            />
          </FormControl>
          
          <FormControl variant="outlined" fullWidth className={classes.formField}>
            <InputLabel htmlFor="confirm-password">Confirm Password</InputLabel>
            <OutlinedInput
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              error={!!passwordError}
              labelWidth={130}
            />
            {passwordError && (
              <FormHelperText error>{passwordError}</FormHelperText>
            )}
          </FormControl>
          
          {renderPasswordRequirements()}
          
          {error && (
            <Typography variant="body2" className={classes.errorText}>
              {error}
            </Typography>
          )}
          
          <Divider style={{ margin: '24px 0 16px' }} />
          
          <div className={classes.actions}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleImport}
              disabled={isImporting || !isValid}
              fullWidth
            >
              {isImporting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Import Wallet'
              )}
            </Button>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default ImportWallet;