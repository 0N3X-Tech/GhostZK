import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Fade,
  InputAdornment,
  Chip,
  Alert
} from '@material-ui/core';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Lock as LockIcon
} from '@material-ui/icons';

import { RootState } from '../state/store';
import { selectActiveAccount } from '../state/wallet/selectors';
import { TransactionStatus, TransactionType } from '../state/transactions/reducer';

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
      marginTop: theme.spacing(3),
      display: 'flex',
      justifyContent: 'space-between',
    },
    errorText: {
      color: theme.palette.error.main,
      marginTop: theme.spacing(1),
    },
    summaryItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing(1.5),
    },
    summaryLabel: {
      opacity: 0.7,
    },
    summaryValue: {
      fontWeight: 500,
    },
    divider: {
      margin: theme.spacing(2, 0),
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
    infoBox: {
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      border: '1px solid rgba(33, 150, 243, 0.5)',
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2),
      marginBottom: theme.spacing(3),
      display: 'flex',
      alignItems: 'flex-start',
    },
    infoIcon: {
      color: theme.palette.info.main,
      marginRight: theme.spacing(1),
      marginTop: theme.spacing(0.5),
    },
    stepper: {
      backgroundColor: 'transparent',
      padding: theme.spacing(0, 0, 3, 0),
    },
    privacyChip: {
      display: 'flex',
      alignItems: 'center',
      '& svg': {
        marginRight: theme.spacing(0.5),
      },
    },
    statusProgress: {
      textAlign: 'center',
      padding: theme.spacing(3),
    },
    statusIcon: {
      fontSize: 64,
      marginBottom: theme.spacing(2),
    },
    successIcon: {
      color: theme.palette.success.main,
    },
    errorIcon: {
      color: theme.palette.error.main,
    },
    cancelButton: {
      marginRight: theme.spacing(1),
    },
    confirmButton: {
      marginLeft: theme.spacing(1),
    },
    passwordField: {
      marginTop: theme.spacing(2),
    },
    timeEstimate: {
      marginTop: theme.spacing(2),
      fontStyle: 'italic',
      opacity: 0.7,
    },
  })
);

// Steps for transaction confirmation
const steps = ['Review Details', 'Generate Proof', 'Submit Transaction'];

interface TransactionConfirmProps {
  // In a real implementation, these would be populated from Redux or a route parameter
  // For this example, we'll use mock data
}

const TransactionConfirm: React.FC<TransactionConfirmProps> = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Redux state
  const account = useSelector(selectActiveAccount);
  const requirePassword = useSelector((state: RootState) => state.settings.requirePasswordForTransactions);
  
  // Mock transaction data - in real app, this would come from Redux or router state
  const mockTransaction = {
    type: TransactionType.TRANSFER_PRIVATE,
    fromAddress: account?.address || '',
    toAddress: 'aleo1abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567',
    amount: '10.5',
    fee: '0.001',
    note: 'Payment for services',
    timestamp: Date.now(),
    programId: 'token.aleo',
    functionName: 'transfer_private'
  };
  
  // Component state
  const [activeStep, setActiveStep] = useState(0);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [proofProgress, setProofProgress] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  
  // Effect to simulate proof generation progress
  useEffect(() => {
    if (activeStep === 1) {
      const interval = setInterval(() => {
        setProofProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            // Move to next step after proof is complete
            setTimeout(() => {
              setActiveStep(2);
              setTransactionStatus(TransactionStatus.SUBMITTING);
              
              // Simulate transaction submission
              setTimeout(() => {
                setTransactionStatus(TransactionStatus.CONFIRMED);
                setTransactionId('tx_12345abcdef');
              }, 3000);
            }, 500);
            return 100;
          }
          return prev + 5;
        });
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [activeStep]);
  
  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError('');
  };
  
  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Handle back button click
  const handleBack = () => {
    if (activeStep === 0) {
      handleCancel();
    } else if (activeStep > 0 && transactionStatus !== TransactionStatus.CONFIRMED) {
      setShowCancelDialog(true);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/');
  };
  
  // Handle confirm transaction
  const handleConfirm = async () => {
    if (requirePassword && !password) {
      setPasswordError('Password is required to confirm transactions');
      return;
    }
    
    setIsSubmitting(true);
    setActiveStep(1);
    setTransactionStatus(TransactionStatus.GENERATING_PROOF);
    
    // In a real implementation, this would dispatch an action to confirm the transaction
    // For this example, we'll simulate the process
  };
  
  // Handle continue to dashboard
  const handleContinue = () => {
    navigate('/');
  };
  
  // Handle cancel dialog confirm
  const handleCancelConfirm = () => {
    setShowCancelDialog(false);
    navigate('/');
  };
  
  // Handle cancel dialog close
  const handleCancelDialogClose = () => {
    setShowCancelDialog(false);
  };
  
  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    if (address.length <= 20) return address;
    
    const prefix = address.substring(0, 10);
    const suffix = address.substring(address.length - 10);
    return `${prefix}...${suffix}`;
  };
  
  // Render transaction details
  const renderTransactionDetails = () => {
    const totalAmount = (parseFloat(mockTransaction.amount) + parseFloat(mockTransaction.fee)).toFixed(6);
    
    return (
      <>
        <Typography variant="h6" className={classes.title}>Confirm Transaction</Typography>
        <Typography variant="body2" className={classes.subtitle}>
          Review the transaction details before confirming
        </Typography>
        
        <div className={classes.warningBox}>
          <WarningIcon className={classes.warningIcon} />
          <div>
            <Typography variant="body2" gutterBottom>
              <strong>Important:</strong> This transaction cannot be reversed once confirmed.
            </Typography>
            <Typography variant="body2">
              Make sure the recipient address and amount are correct.
            </Typography>
          </div>
        </div>
        
        <div className={classes.summaryItem}>
          <Typography variant="body2" className={classes.summaryLabel}>Transaction Type</Typography>
          <div className={classes.privacyChip}>
            {mockTransaction.type === TransactionType.TRANSFER_PRIVATE ? (
              <>
                <VisibilityOffIcon fontSize="small" />
                <Typography variant="body2">Private</Typography>
              </>
            ) : (
              <>
                <VisibilityIcon fontSize="small" />
                <Typography variant="body2">Public</Typography>
              </>
            )}
          </div>
        </div>
        
        <div className={classes.summaryItem}>
          <Typography variant="body2" className={classes.summaryLabel}>From</Typography>
          <Typography variant="body2" className={classes.summaryValue}>
            {formatAddress(mockTransaction.fromAddress)}
          </Typography>
        </div>
        
        <div className={classes.summaryItem}>
          <Typography variant="body2" className={classes.summaryLabel}>To</Typography>
          <Typography variant="body2" className={classes.summaryValue}>
            {formatAddress(mockTransaction.toAddress)}
          </Typography>
        </div>
        
        <div className={classes.summaryItem}>
          <Typography variant="body2" className={classes.summaryLabel}>Amount</Typography>
          <Typography variant="body2" className={classes.summaryValue}>{mockTransaction.amount} ALEO</Typography>
        </div>
        
        <div className={classes.summaryItem}>
          <Typography variant="body2" className={classes.summaryLabel}>Network Fee</Typography>
          <Typography variant="body2" className={classes.summaryValue}>{mockTransaction.fee} ALEO</Typography>
        </div>
        
        <Divider className={classes.divider} />
        
        <div className={classes.summaryItem}>
          <Typography variant="body1" style={{ fontWeight: 600 }}>Total</Typography>
          <Typography variant="body1" style={{ fontWeight: 600 }}>{totalAmount} ALEO</Typography>
        </div>
        
        {mockTransaction.note && (
          <div className={classes.summaryItem}>
            <Typography variant="body2" className={classes.summaryLabel}>Note</Typography>
            <Typography variant="body2" className={classes.summaryValue}>{mockTransaction.note}</Typography>
          </div>
        )}
        
        {requirePassword && (
          <TextField
            className={classes.passwordField}
            label="Wallet Password"
            variant="outlined"
            fullWidth
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            error={!!passwordError}
            helperText={passwordError}
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
        )}
        
        <div className={classes.infoBox}>
          <InfoIcon className={classes.infoIcon} />
          <div>
            <Typography variant="body2">
              This transaction will need to generate a zero-knowledge proof, which may take a few minutes.
            </Typography>
          </div>
        </div>
      </>
    );
  };
  
  // Render proof generation status
  const renderProofGeneration = () => {
    return (
      <div className={classes.statusProgress}>
        <CircularProgress 
          variant="determinate" 
          value={proofProgress} 
          size={80} 
          thickness={4} 
          color="primary" 
        />
        <Typography variant="h6" style={{ marginTop: 16 }}>
          Generating Zero-Knowledge Proof
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {proofProgress}% complete
        </Typography>
        <Typography variant="body2" className={classes.timeEstimate}>
          Estimated time remaining: {Math.ceil((100 - proofProgress) / 10)} minutes
        </Typography>
        <Typography variant="caption" color="textSecondary" style={{ marginTop: 16, display: 'block' }}>
          Please keep the extension open. Closing it will cancel the transaction.
        </Typography>
      </div>
    );
  };
  
  // Render transaction submission status
  const renderTransactionSubmission = () => {
    return (
      <div className={classes.statusProgress}>
        {transactionStatus === TransactionStatus.SUBMITTING ? (
          <>
            <CircularProgress size={80} />
            <Typography variant="h6" style={{ marginTop: 16 }}>
              Submitting Transaction
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Your transaction is being submitted to the Aleo network.
            </Typography>
          </>
        ) : transactionStatus === TransactionStatus.CONFIRMED ? (
          <>
            <CheckCircleIcon className={`${classes.statusIcon} ${classes.successIcon}`} />
            <Typography variant="h6">Transaction Confirmed</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Your transaction has been successfully processed.
            </Typography>
            {transactionId && (
              <Chip 
                label={`Transaction ID: ${transactionId}`} 
                color="primary" 
                variant="outlined" 
                style={{ marginTop: 16, marginBottom: 16 }}
              />
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleContinue}
              style={{ marginTop: 24 }}
            >
              Continue to Dashboard
            </Button>
          </>
        ) : transactionStatus === TransactionStatus.FAILED ? (
          <>
            <ErrorIcon className={`${classes.statusIcon} ${classes.errorIcon}`} />
            <Typography variant="h6">Transaction Failed</Typography>
            <Typography variant="body2" color="error" gutterBottom>
              {generalError || 'An error occurred while processing your transaction.'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleContinue}
              style={{ marginTop: 24 }}
            >
              Return to Dashboard
            </Button>
          </>
        ) : null}
      </div>
    );
  };
  
  // Get content for current step
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderTransactionDetails();
      case 1:
        return renderProofGeneration();
      case 2:
        return renderTransactionSubmission();
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
        <Typography variant="h6">Transaction</Typography>
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
          
          {activeStep === 0 && (
            <>
              <Divider className={classes.divider} />
              
              <div className={classes.actions}>
                <Button 
                  onClick={handleCancel}
                  className={classes.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleConfirm}
                  className={classes.confirmButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Confirm'}
                </Button>
              </div>
            </>
          )}
        </Paper>
      </div>
      
      {/* Confirmation Dialog for Cancelling Transaction */}
      <Dialog
        open={showCancelDialog}
        onClose={handleCancelDialogClose}
        aria-labelledby="cancel-dialog-title"
      >
        <DialogTitle id="cancel-dialog-title">Cancel Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this transaction? Any progress will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose} color="primary">
            Continue Transaction
          </Button>
          <Button onClick={handleCancelConfirm} color="secondary">
            Cancel Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TransactionConfirm;