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
  Stepper,
  Step,
  StepLabel,
  Box,
  Divider,
  IconButton,
  Chip,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Fade
} from '@material-ui/core';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FileCopy as CopyIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@material-ui/icons';
import { createWallet } from '../state/wallet/actions';
import { selectIsCreatingWallet, selectError } from '../state/wallet/selectors';

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
    actions: {
      marginTop: theme.spacing(2),
      display: 'flex',
      justifyContent: 'flex-end',
    },
    stepper: {
      background: 'transparent',
      padding: theme.spacing(0, 0, 3, 0),
    },
    mnemonicContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: theme.spacing(1),
      backgroundColor: theme.palette.background.default,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2),
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(3),
    },
    mnemonicWord: {
      backgroundColor: theme.palette.primary.dark,
      color: theme.palette.primary.contrastText,
      padding: theme.spacing(1, 1.5),
      borderRadius: theme.shape.borderRadius,
      minWidth: '70px',
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      userSelect: 'none',
    },
    mnemonicIndex: {
      position: 'absolute',
      top: 0,
      left: 4,
      fontSize: '0.6rem',
      opacity: 0.7,
    },
    copyButton: {
      marginLeft: 'auto',
      color: theme.palette.text.secondary,
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
    verificationContainer: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(3),
    },
    verificationWords: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
    },
    verificationSlot: {
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.palette.action.hover,
      borderRadius: theme.shape.borderRadius,
      border: `1px dashed ${theme.palette.divider}`,
    },
    wordOptions: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: theme.spacing(1),
      marginTop: theme.spacing(2),
    },
    wordOption: {
      cursor: 'pointer',
      userSelect: 'none',
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
      '&.selected': {
        opacity: 0.5,
        pointerEvents: 'none',
      },
    },
    errorText: {
      color: theme.palette.error.main,
      marginTop: theme.spacing(1),
    },
  })
);

// Steps for wallet creation
const steps = ['Create Password', 'Backup Recovery Phrase', 'Verify Recovery Phrase'];

// Simulate mnemonic phrase generation (in a real app, this would come from the keyring service)
const generateMnemonic = () => {
  const words = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
    'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
    'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
    'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent'
  ];
  
  const mnemonic = [];
  for (let i = 0; i < 24; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    mnemonic.push(words[randomIndex]);
  }
  
  return mnemonic;
};

const CreateWallet: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const isCreating = useSelector(selectIsCreatingWallet);
  const error = useSelector(selectError);
  
  // Component state
  const [activeStep, setActiveStep] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mnemonicPhrase, setMnemonicPhrase] = useState<string[]>([]);
  const [mnemonicCopied, setMnemonicCopied] = useState(false);
  const [hasBackedUp, setHasBackedUp] = useState(false);
  const [verificationIndices, setVerificationIndices] = useState<number[]>([]);
  const [verificationAnswers, setVerificationAnswers] = useState<string[]>([]);
  const [wordOptions, setWordOptions] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [verificationError, setVerificationError] = useState('');
  
  // Password requirements
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword;
  
  // Initialize mnemonic and verification words
  useEffect(() => {
    // Generate mnemonic phrase
    if (mnemonicPhrase.length === 0) {
      setMnemonicPhrase(generateMnemonic());
    }
    
    // Select random indices for verification
    if (verificationIndices.length === 0) {
      const indices = [];
      while (indices.length < 3) {
        const randomIndex = Math.floor(Math.random() * 24);
        if (!indices.includes(randomIndex)) {
          indices.push(randomIndex);
        }
      }
      setVerificationIndices(indices.sort((a, b) => a - b));
      setVerificationAnswers(Array(3).fill(''));
    }
  }, [mnemonicPhrase, verificationIndices]);
  
  // Generate word options for verification
  useEffect(() => {
    if (activeStep === 2 && mnemonicPhrase.length > 0 && verificationIndices.length > 0) {
      // Include the correct words
      const correctWords = verificationIndices.map(index => mnemonicPhrase[index]);
      
      // Add some random wrong options
      const options = [...correctWords];
      const availableWords = mnemonicPhrase.filter((word, index) => !verificationIndices.includes(index));
      
      while (options.length < 9) {
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        const word = availableWords[randomIndex];
        if (!options.includes(word)) {
          options.push(word);
        }
      }
      
      // Shuffle the options
      setWordOptions(options.sort(() => Math.random() - 0.5));
    }
  }, [activeStep, mnemonicPhrase, verificationIndices]);
  
  // Validate form on each step
  useEffect(() => {
    switch (activeStep) {
      case 0:
        setIsValid(
          hasMinLength && 
          hasUppercase && 
          hasLowercase && 
          hasNumber && 
          hasSpecial && 
          passwordsMatch
        );
        break;
      case 1:
        setIsValid(hasBackedUp);
        break;
      case 2:
        const correctAnswers = verificationIndices.map(index => mnemonicPhrase[index]);
        const allCorrect = verificationAnswers.every((answer, i) => answer === correctAnswers[i]);
        setIsValid(allCorrect && verificationAnswers.every(answer => answer !== ''));
        break;
      default:
        setIsValid(false);
    }
  }, [
    activeStep, 
    hasMinLength, 
    hasUppercase, 
    hasLowercase, 
    hasNumber, 
    hasSpecial, 
    passwordsMatch, 
    hasBackedUp, 
    verificationAnswers, 
    verificationIndices, 
    mnemonicPhrase
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
  
  // Copy mnemonic to clipboard
  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(mnemonicPhrase.join(' '));
    setMnemonicCopied(true);
    setTimeout(() => setMnemonicCopied(false), 3000);
  };
  
  // Handle verification word selection
  const handleSelectWord = (word: string) => {
    const emptyIndex = verificationAnswers.findIndex(answer => answer === '');
    if (emptyIndex !== -1) {
      const newAnswers = [...verificationAnswers];
      newAnswers[emptyIndex] = word;
      setVerificationAnswers(newAnswers);
      setVerificationError('');
    }
  };
  
  // Remove a selected verification word
  const handleRemoveWord = (index: number) => {
    const newAnswers = [...verificationAnswers];
    newAnswers[index] = '';
    setVerificationAnswers(newAnswers);
  };
  
  // Handle next button click
  const handleNext = () => {
    if (activeStep === 0) {
      if (!isValid) {
        setPasswordError('Please ensure your password meets all requirements');
        return;
      }
    } else if (activeStep === 1) {
      if (!hasBackedUp) {
        return;
      }
    } else if (activeStep === 2) {
      if (!isValid) {
        setVerificationError('The selected words are incorrect. Please try again.');
        return;
      }
    }
    
    setActiveStep(activeStep + 1);
  };
  
  // Handle back button click
  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/welcome');
    } else {
      setActiveStep(activeStep - 1);
    }
  };
  
  // Create the wallet
  const handleCreateWallet = async () => {
    try {
      await dispatch(createWallet(password) as any);
      navigate('/');
    } catch (error) {
      console.error('Failed to create wallet:', error);
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
  
  // Render steps
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div>
            <Typography variant="h6" className={classes.title}>Create Password</Typography>
            <Typography variant="body2" className={classes.subtitle}>
              Create a strong password to secure your wallet. You'll need this password to unlock your wallet.
            </Typography>
            
            <TextField
              className={classes.formField}
              label="Password"
              variant="outlined"
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
            
            <TextField
              className={classes.formField}
              label="Confirm Password"
              variant="outlined"
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
            />
            
            {renderPasswordRequirements()}
            
            {passwordError && (
              <Typography variant="body2" className={classes.errorText}>
                {passwordError}
              </Typography>
            )}
          </div>
        );
      case 1:
        return (
          <div>
            <Typography variant="h6" className={classes.title}>Recovery Phrase</Typography>
            <Typography variant="body2" className={classes.subtitle}>
              Your recovery phrase is the only way to restore your wallet if you lose access. Write it down and keep it in a safe place.
            </Typography>
            
            <div className={classes.warningBox}>
              <WarningIcon className={classes.warningIcon} />
              <div>
                <Typography variant="body2" gutterBottom>
                  <strong>Important:</strong> Never share your recovery phrase with anyone.
                </Typography>
                <Typography variant="body2">
                  Anyone with this phrase can access your wallet and your funds.
                </Typography>
              </div>
            </div>
            
            <Box display="flex" alignItems="center" marginBottom={2}>
              <Typography variant="subtitle2">Your 24-word Recovery Phrase</Typography>
              <IconButton 
                className={classes.copyButton} 
                size="small" 
                onClick={handleCopyMnemonic}
                title="Copy to clipboard"
              >
                {mnemonicCopied ? <CheckCircleIcon color="primary" /> : <CopyIcon />}
              </IconButton>
            </Box>
            
            <div className={classes.mnemonicContainer}>
              {mnemonicPhrase.map((word, index) => (
                <div key={index} className={classes.mnemonicWord}>
                  <span className={classes.mnemonicIndex}>{index + 1}</span>
                  {word}
                </div>
              ))}
            </div>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={hasBackedUp}
                  onChange={(e) => setHasBackedUp(e.target.checked)}
                  color="primary"
                />
              }
              label="I have securely backed up my recovery phrase"
            />
          </div>
        );
      case 2:
        return (
          <div>
            <Typography variant="h6" className={classes.title}>Verify Recovery Phrase</Typography>
            <Typography variant="body2" className={classes.subtitle}>
              Select the correct words to verify you've backed up your recovery phrase.
            </Typography>
            
            <div className={classes.verificationContainer}>
              <div className={classes.verificationWords}>
                {verificationIndices.map((wordIndex, index) => (
                  <Box key={index} display="flex" alignItems="center">
                    <Typography variant="body2" style={{ minWidth: '100px' }}>
                      Word #{wordIndex + 1}:
                    </Typography>
                    {verificationAnswers[index] ? (
                      <Chip
                        label={verificationAnswers[index]}
                        onDelete={() => handleRemoveWord(index)}
                        color="primary"
                      />
                    ) : (
                      <div className={classes.verificationSlot} style={{ flex: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          Select a word
                        </Typography>
                      </div>
                    )}
                  </Box>
                ))}
              </div>
              
              <div className={classes.wordOptions}>
                {wordOptions.map((word, index) => (
                  <Chip
                    key={index}
                    label={word}
                    onClick={() => handleSelectWord(word)}
                    className={`${classes.wordOption} ${verificationAnswers.includes(word) ? 'selected' : ''}`}
                    clickable={!verificationAnswers.includes(word)}
                    variant="outlined"
                  />
                ))}
              </div>
            </div>
            
            {verificationError && (
              <Typography variant="body2" className={classes.errorText}>
                {verificationError}
              </Typography>
            )}
          </div>
        );
      case 3:
        return (
          <div>
            <Typography variant="h6" className={classes.title}>Create Wallet</Typography>
            <Typography variant="body2" className={classes.subtitle}>
              You're all set! Click the button below to create your wallet.
            </Typography>
            
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              my={4}
            >
              <CheckCircleIcon 
                style={{ fontSize: 80, color: '#4caf50', marginBottom: 16 }} 
              />
              <Typography variant="h6" gutterBottom align="center">
                Ready to Create Your Wallet
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Your wallet will be secured with your password and recovery phrase
              </Typography>
            </Box>
            
            {error && (
              <Typography variant="body2" className={classes.errorText}>
                {error}
              </Typography>
            )}
          </div>
        );
      default:
        return 'Unknown step';
    }
  };
  
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
        <Typography variant="h6">Create New Wallet</Typography>
      </div>
      
      <div className={classes.content}>
        <Stepper activeStep={activeStep} className={classes.stepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Paper className={classes.paper}>
          {getStepContent(activeStep)}
          
          <Divider style={{ margin: '16px 0' }} />
          
          <div className={classes.actions}>
            {activeStep === steps.length ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateWallet}
                disabled={isCreating}
                fullWidth
              >
                {isCreating ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create Wallet'
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={!isValid}
              >
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            )}
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default CreateWallet;