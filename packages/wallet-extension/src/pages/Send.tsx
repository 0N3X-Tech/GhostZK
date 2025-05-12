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
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  MenuItem,
  Select,
  FormHelperText
} from '@material-ui/core';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon
} from '@material-ui/icons';

import { RootState } from '../state/store';
import { selectActiveAccount } from '../state/wallet/selectors';
import { selectNetworkStatus } from '../state/network/selectors';
import { PrivacyLevel } from '../state/settings/reducer';
import { Transaction, TransactionStatus, TransactionType } from '../state/transactions/reducer';
import { NetworkStatus } from '../state/network/reducer';

// Mock action for creating transactions - to be replaced with actual action
const createTransaction = (data: any) => {
  return (dispatch: any) => {
    // Implementation will come from transactions/actions.ts
    return Promise.resolve({ id: 'mock-tx-id' });
  };
};

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
    balanceInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing(2),
    },
    balanceValue: {
      fontWeight: 500,
    },
    privacySelector: {
      marginBottom: theme.spacing(3),
    },
    stepper: {
      backgroundColor: 'transparent',
      marginBottom: theme.spacing(3),
      padding: 0,
    },
    divider: {
      margin: theme.spacing(3, 0),
    },
    feeInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing(2),
      padding: theme.spacing(1),
      backgroundColor: theme.palette.background.default,
      borderRadius: theme.shape.borderRadius,
    },
    infoIcon: {
      fontSize: '1rem',
      marginRight: theme.spacing(0.5),
      color: theme.palette.info.main,
    },
    note: {
      fontSize: '0.875rem',
      opacity: 0.7,
      marginTop: theme.spacing(1),
      display: 'flex',
      alignItems: 'center',
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
    privacyChip: {
      display: 'flex',
      alignItems: 'center',
      '& svg': {
        marginRight: theme.spacing(0.5),
      },
    },
    confirmButton: {
      marginTop: theme.spacing(2),
    },
    transactionProgress: {
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
    processingIcon: {
      animation: '$spin 1.5s linear infinite',
    },
    '@keyframes spin': {
      '0%': {
        transform: 'rotate(0deg)',
      },
      '100%': {
        transform: 'rotate(360deg)',
      },
    },
    maxButton: {
      marginLeft: theme.spacing(1),
      height: 24,
      fontSize: '0.75rem',
    },
  })
);

// Steps for sending transaction
const steps = ['Enter Details', 'Review', 'Sign & Send'];

const Send: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const account = useSelector(selectActiveAccount);
  const networkStatus = useSelector(selectNetworkStatus);
  const privacyLevel = useSelector((state: RootState) => state.settings.privacyLevel);
  
  // Balances (mock data - should be fetched from redux state)
  const publicBalance = account ? 100 : 0; // Replace with actual balance
  const privateBalance = account ? 50 : 0;  // Replace with actual balance
  
  // Component state
  const [activeStep, setActiveStep] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'public' | 'private'>('private');
  const [note, setNote] = useState('');
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState('0.001');
  const [addressError, setAddressError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Validate form
  const isValidAddress = (address: string) => {
    // Replace with actual Aleo address validation
    return address.startsWith('aleo1') && address.length === 63;
  };
  
  const isValidAmount = (amount: string) => {
    const amountNum = parseFloat(amount);
    const maxBalance = transactionType === 'public' ? publicBalance : privateBalance;
    return !isNaN(amountNum) && amountNum > 0 && amountNum <= maxBalance;
  };
  
  const isFormValid = () => {
    return isValidAddress(recipient) && isValidAmount(amount);
  };
  
  // Effect to recalculate fee when inputs change
  useEffect(() => {
    if (recipient && amount && !isNaN(parseFloat(amount))) {
      setIsCalculatingFee(true);
      // Simulating fee calculation
      setTimeout(() => {
        setEstimatedFee('0.001');
        setIsCalculatingFee(false);
      }, 500);
    }
  }, [recipient, amount, transactionType]);
  
  // Handle recipient address change
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setRecipient(address);
    setAddressError('');
  };
  
  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
    setAmountError('');
  };
  
  // Handle setting max amount
  const handleSetMaxAmount = () => {
    const maxBalance = transactionType === 'public' ? publicBalance : privateBalance;
    const maxAmount = Math.max(0, maxBalance - parseFloat(estimatedFee)).toString();
    setAmount(maxAmount);
  };
  
  // Handle transaction type change
  const handleTransactionTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTransactionType(event.target.value as 'public' | 'private');
  };
  
  // Handle note change
  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNote(e.target.value);
  };
  
  // Go back button handler
  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/');
    } else {
      setActiveStep(activeStep - 1);
    }
  };
  
  // Next button handler
  const handleNext = () => {
    if (activeStep === 0) {
      // Validate form
      if (!isValidAddress(recipient)) {
        setAddressError('Please enter a valid Aleo address');
        return;
      }
      
      if (!isValidAmount(amount)) {
        setAmountError('Please enter a valid amount');
        return;
      }
    }
    
    if (activeStep === 1) {
      // Show confirmation dialog
      setShowConfirmDialog(true);
      return;
    }
    
    setActiveStep(activeStep + 1);
  };
  
  // Handle transaction submission
  const handleSubmitTransaction = async () => {
    setShowConfirmDialog(false);
    setActiveStep(2);
    setIsSubmitting(true);
    setTransactionStatus(TransactionStatus.GENERATING_PROOF);
    
    try {
      // Create transaction data
      const transactionData = {
        type: transactionType === 'public' ? TransactionType.TRANSFER_PUBLIC : TransactionType.TRANSFER_PRIVATE,
        fromAddress: account?.address,
        toAddress: recipient,
        amount,
        fee: estimatedFee,
        note,
        timestamp: Date.now()
      };
      
      // Dispatch create transaction action
      const result = await dispatch(createTransaction(transactionData) as any);
      
      // Set transaction ID
      setTransactionId(result.id);
      
      // Simulate proof generation
      setTimeout(() => {
        setTransactionStatus(TransactionStatus.SUBMITTING);
        
        // Simulate transaction submission
        setTimeout(() => {
          setTransactionStatus(TransactionStatus.CONFIRMED);
          setIsSubmitting(false);
        }, 3000);
      }, 5000);
      
    } catch (error) {
      console.error('Transaction failed:', error);
      setTransactionStatus(TransactionStatus.FAILED);
      setGeneralError(error instanceof Error ? error.message : 'Transaction failed');
      setIsSubmitting(false);
    }
  };
  
  // Handle view transaction details
  const handleViewTransaction = () => {
    // Navigate to transaction details page
    navigate('/');
  };
  
  // Handle new transaction
  const handleNewTransaction = () => {
    // Reset form and go to step 0
    setActiveStep(0);
    setRecipient('');
    setAmount('');
    setNote('');
    setTransactionStatus(null);
    setTransactionId(null);
    setGeneralError('');
  };
  
  // Render transaction details form
  const renderDetailsForm = () => (
    <>
      <div className={classes.balanceInfo}>
        <Typography variant="body2">Available Balance</Typography>
        <Typography variant="body1" className={classes.balanceValue}>
          {transactionType === 'public' ? publicBalance : privateBalance} ALEO
        </Typography>
      </div>
      
      <div className={classes.privacySelector}>
        <Typography variant="body2" gutterBottom>Transaction Type</Typography>
        <FormControl component="fieldset">
          <RadioGroup 
            aria-label="transaction-type" 
            name="transaction-type" 
            value={transactionType} 
            onChange={handleTransactionTypeChange}
            row
          >
            <FormControlLabel 
              value="private" 
              control={<Radio color="primary" />} 
              label={
                <Box display="flex" alignItems="center">
                  <VisibilityOffIcon fontSize="small" style={{ marginRight: 8 }} />
                  <Typography variant="body2">Private</Typography>
                </Box>
              } 
            />
            <FormControlLabel 
              value="public" 
              control={<Radio color="primary" />} 
              label={
                <Box display="flex" alignItems="center">
                  <VisibilityIcon fontSize="small" style={{ marginRight: 8 }} />
                  <Typography variant="body2">Public</Typography>
                </Box>
              } 
            />
          </RadioGroup>
        </FormControl>
        <Typography variant="caption" color="textSecondary">
          {transactionType === 'private' 
            ? 'Private transactions hide amount and transaction details.' 
            : 'Public transactions are visible on the blockchain.'}
        </Typography>
      </div>
      
      <TextField
        className={classes.formField}
        label="Recipient Address"
        variant="outlined"
        fullWidth
        value={recipient}
        onChange={handleRecipientChange}
        error={!!addressError}
        helperText={addressError || 'Enter the Aleo address of the recipient'}
        placeholder="aleo1..."
      />
      
      <TextField
        className={classes.formField}
        label="Amount (ALEO)"
        variant="outlined"
        fullWidth
        value={amount}
        onChange={handleAmountChange}
        error={!!amountError}
        helperText={amountError}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Button 
                variant="outlined" 
                size="small" 
                className={classes.maxButton}
                onClick={handleSetMaxAmount}
              >
                MAX
              </Button>
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        className={classes.formField}
        label="Note (Optional)"
        variant="outlined"
        fullWidth
        value={note}
        onChange={handleNoteChange}
        helperText="This note is encrypted and only visible to the recipient"
        multiline
        rows={2}
      />
      
      <div className={classes.feeInfo}>
        <Typography variant="body2">Estimated Fee</Typography>
        {isCalculatingFee ? (
          <CircularProgress size={16} />
        ) : (
          <Typography variant="body2">{estimatedFee} ALEO</Typography>
        )}
      </div>
      
      <Typography variant="body2" className={classes.note}>
        <InfoIcon className={classes.infoIcon} />
        Transaction may take a few minutes to process due to zero-knowledge proof generation.
      </Typography>
    </>
  );
  
  // Render transaction review
  const renderReview = () => {
    const totalAmount = (parseFloat(amount) + parseFloat(estimatedFee)).toFixed(6);
    
    return (
      <>
        <Typography variant="body2" gutterBottom>
          Review your transaction details before sending.
        </Typography>
        
        <Divider className={classes.divider} />
        
        <div className={classes.summaryItem}>
          <Typography variant="body2" className={classes.summaryLabel}>Transaction Type</Typography>
          <div className={classes.privacyChip}>
            {transactionType === 'private' ? (
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
            {account?.address.substring(0, 8)}...{account?.address.substring(account.address.length - 8)}
          </Typography>
        </div>
        
        <div className={classes.summaryItem}>
          <Typography variant="body2" className={classes.summaryLabel}>To</Typography>
          <Typography variant="body2" className={classes.summaryValue}>
            {recipient.substring(0, 8)}...{recipient.substring(recipient.length - 8)}
          </Typography>
        </div>
        
        <div className={classes.summaryItem}>
          <Typography variant="body2" className={classes.summaryLabel}>Amount</Typography>
          <Typography variant="body2" className={classes.summaryValue}>{amount} ALEO</Typography>
        </div>
        
        <div className={classes.summaryItem}>
          <Typography variant="body2" className={classes.summaryLabel}>Network Fee</Typography>
          <Typography variant="body2" className={classes.summaryValue}>{estimatedFee} ALEO</Typography>
        </div>
        
        <Divider className={classes.divider} />
        
        <div className={classes.summaryItem}>
          <Typography variant="body1" style={{ fontWeight: 600 }}>Total</Typography>
          <Typography variant="body1" style={{ fontWeight: 600 }}>{totalAmount} ALEO</Typography>
        </div>
        
        {note && (
          <div className={classes.summaryItem}>
            <Typography variant="body2" className={classes.summaryLabel}>Note</Typography>
            <Typography variant="body2" className={classes.summaryValue}>{note}</Typography>
          </div>
        )}
      </>
    );
  };
  
  // Render transaction status
  const renderTransactionStatus = () => {
    const getStatusContent = () => {
      switch (transactionStatus) {
        case TransactionStatus.GENERATING_PROOF:
          return (
            <>
              <CircularProgress className={classes.statusIcon} color="primary" />
              <Typography variant="h6" gutterBottom>Generating Zero-Knowledge Proof</Typography>
              <Typography variant="body2" color="textSecondary">
                This may take a few minutes. Please keep the extension open.
              </Typography>
            </>
          );
        case TransactionStatus.SUBMITTING:
          return (
            <>
              <CircularProgress className={classes.statusIcon} color="primary" />
              <Typography variant="h6" gutterBottom>Submitting Transaction</Typography>
              <Typography variant="body2" color="textSecondary">
                Your transaction is being submitted to the Aleo network.
              </Typography>
            </>
          );
        case TransactionStatus.CONFIRMED:
          return (
            <>
              <CheckCircleIcon className={`${classes.statusIcon} ${classes.successIcon}`} />
              <Typography variant="h6" gutterBottom>Transaction Completed</Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Your transaction has been successfully processed.
              </Typography>
              {transactionId && (
                <Chip 
                  label={`ID: ${transactionId.substring(0, 16)}...`} 
                  color="primary" 
                  variant="outlined" 
                  style={{ marginTop: 16, marginBottom: 16 }}
                />
              )}
            </>
          );
        case TransactionStatus.FAILED:
          return (
            <>
              <ErrorIcon className={`${classes.statusIcon} ${classes.errorIcon}`} />
              <Typography variant="h6" gutterBottom>Transaction Failed</Typography>
              <Typography variant="body2" color="error" gutterBottom>
                {generalError || 'An error occurred while processing your transaction.'}
              </Typography>
            </>
          );
        default:
          return null;
      }
    };
    
    return (
      <div className={classes.transactionProgress}>
        {getStatusContent()}
        
        {transactionStatus === TransactionStatus.CONFIRMED && (
          <Box mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleViewTransaction}
              style={{ marginRight: 8 }}
            >
              View Details
            </Button>
            <Button
              variant="outlined"
              onClick={handleNewTransaction}
            >
              New Transaction
            </Button>
          </Box>
        )}
        
        {transactionStatus === TransactionStatus.FAILED && (
          <Box mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNewTransaction}
            >
              Try Again
            </Button>
          </Box>
        )}
      </div>
    );
  };
  
  // Get content for current step
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderDetailsForm();
      case 1:
        return renderReview();
      case 2:
        return renderTransactionStatus();
      default:
        return 'Unknown step';
    }
  };
  
  // Render confirmation dialog
  const renderConfirmationDialog = () => (
    <Dialog
      open={showConfirmDialog}
      onClose={() => setShowConfirmDialog(false)}
    >
      <DialogTitle>Confirm Transaction</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You are about to send {amount} ALEO to:
          <br />
          <strong>{recipient.substring(0, 10)}...{recipient.substring(recipient.length - 10)}</strong>
          <br /><br />
          This action cannot be undone. Do you want to proceed?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowConfirmDialog(false)} color="default">
          Cancel
        </Button>
        <Button onClick={handleSubmitTransaction} color="primary">
          Confirm & Send
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  // Main render
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
        <Typography variant="h6">Send ALEO</Typography>
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
          
          {activeStep !== 2 && (
            <>
              <Divider className={classes.divider} />
              
              <div className={classes.actions}>
                <Button onClick={handleBack}>
                  {activeStep === 0 ? 'Cancel' : 'Back'}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={activeStep === 0 && !isFormValid()}
                >
                  {activeStep === 1 ? 'Send' : 'Next'}
                </Button>
              </div>
            </>
          )}
        </Paper>
      </div>
      
      {renderConfirmationDialog()}
    </div>
  );
};

export default Send;