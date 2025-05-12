import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  makeStyles,
  Theme,
  createStyles,
  Paper,
  Typography,
  Button,
  IconButton,
  Divider,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Snackbar,
  InputAdornment,
  Tooltip
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  FileCopy as CopyIcon,
  VpnKey as KeyIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Send as SendIcon,
  CallReceived as ReceiveIcon,
  History as HistoryIcon,
  AccountBalanceWallet as WalletIcon,
  Lock as LockIcon,
  Warning as WarningIcon
} from '@material-ui/icons';

import { RootState } from '../state/store';
import { selectAccountByIndex, selectIsUnlocked } from '../state/wallet/selectors';
import { Transaction, TransactionStatus, TransactionType } from '../state/transactions/reducer';
import { AleoAccount } from '../../services/keyring';

// Mock actions - replace with actual actions when implementing
const renameAccount = (index: number, name: string) => {
  return { type: 'WALLET_RENAME_ACCOUNT', payload: { index, name } };
};

const removeAccount = (index: number) => {
  return { type: 'WALLET_REMOVE_ACCOUNT', payload: index };
};

const exportPrivateKey = (index: number, password: string) => {
  // This would be properly implemented in the actual wallet
  return () => Promise.resolve('private_key_mock_value');
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
      justifyContent: 'space-between',
    },
    headerLeft: {
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    subtitle: {
      marginBottom: theme.spacing(2),
      opacity: 0.7,
    },
    addressContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing(1.5),
      borderRadius: theme.shape.borderRadius,
      marginBottom: theme.spacing(3),
      wordBreak: 'break-all',
      fontFamily: 'monospace',
      fontSize: '0.85rem',
    },
    copyButton: {
      marginLeft: theme.spacing(1),
    },
    section: {
      marginBottom: theme.spacing(3),
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(2),
    },
    actionButtons: {
      display: 'flex',
      gap: theme.spacing(1),
      marginBottom: theme.spacing(3),
    },
    actionButton: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: theme.spacing(1.5, 1),
    },
    divider: {
      margin: theme.spacing(3, 0),
    },
    balanceCard: {
      padding: theme.spacing(2),
      marginBottom: theme.spacing(3),
      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
      color: theme.palette.primary.contrastText,
      borderRadius: theme.shape.borderRadius,
    },
    balanceValue: {
      fontSize: '1.2rem',
      fontWeight: 600,
      marginRight: theme.spacing(1),
    },
    balanceLabel: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(0.5),
      fontSize: '0.875rem',
      opacity: 0.9,
      '& svg': {
        marginRight: theme.spacing(0.5),
        fontSize: '1rem',
      },
    },
    transaction: {
      padding: theme.spacing(1.5),
      marginBottom: theme.spacing(1),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    transactionLeft: {
      display: 'flex',
      alignItems: 'center',
    },
    transactionIcon: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.palette.background.default,
      marginRight: theme.spacing(1.5),
    },
    transactionDetails: {
      display: 'flex',
      flexDirection: 'column',
    },
    transactionTitle: {
      fontWeight: 500,
      fontSize: '0.875rem',
    },
    transactionDate: {
      fontSize: '0.75rem',
      opacity: 0.7,
    },
    transactionValue: {
      fontWeight: 500,
    },
    passwordField: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
    warningBox: {
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
      border: '1px solid rgba(255, 152, 0, 0.3)',
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2),
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      display: 'flex',
      alignItems: 'flex-start',
    },
    warningIcon: {
      color: theme.palette.warning.main,
      marginRight: theme.spacing(1),
      marginTop: theme.spacing(0.5),
    },
    privateKeyBox: {
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      fontFamily: 'monospace',
      wordBreak: 'break-all',
      marginBottom: theme.spacing(2),
      fontSize: '0.85rem',
    },
    emptyState: {
      textAlign: 'center',
      padding: theme.spacing(3),
      opacity: 0.7,
    },
    dangerButton: {
      color: theme.palette.error.main,
      borderColor: theme.palette.error.main,
    },
  })
);

const AccountDetails: React.FC = () => {
  const classes = useStyles();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Convert string id to number for account index
  const accountIndex = id ? parseInt(id, 10) : 0;
  
  // Redux state
  const account = useSelector((state: RootState) => selectAccountByIndex(state, accountIndex));
  const isUnlocked = useSelector(selectIsUnlocked);
  
  // Mock data for transactions - would come from redux store in real app
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Local state
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [showPrivateKeyDialog, setShowPrivateKeyDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedPrivateKey, setCopiedPrivateKey] = useState(false);
  
  // Setup
  useEffect(() => {
    if (!isUnlocked) {
      navigate('/unlock');
    }
    
    if (account) {
      setNewName(account.name);
      
      // Mock transactions for this account
      // In a real app, these would be fetched from the store
      setTransactions([
        {
          id: 'tx1',
          type: TransactionType.TRANSFER_PRIVATE,
          status: TransactionStatus.CONFIRMED,
          fromAddress: account.address,
          toAddress: 'aleo1xyz...',
          amount: '5.0',
          timestamp: Date.now() - 86400000, // 1 day ago
          blockHeight: 123456,
          txHash: 'txhash1'
        },
        {
          id: 'tx2',
          type: TransactionType.TRANSFER_PUBLIC,
          status: TransactionStatus.CONFIRMED,
          fromAddress: 'aleo1abc...',
          toAddress: account.address,
          amount: '10.0',
          timestamp: Date.now() - 172800000, // 2 days ago
          blockHeight: 123400,
          txHash: 'txhash2'
        }
      ]);
    }
  }, [account, isUnlocked, navigate]);
  
  // Handle back button click
  const handleBack = () => {
    navigate('/');
  };
  
  // Handle copy address
  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 3000);
    }
  };
  
  // Handle send from this account
  const handleSend = () => {
    navigate('/send');
  };
  
  // Handle receive to this account
  const handleReceive = () => {
    navigate('/receive');
  };
  
  // Start renaming account
  const handleStartRename = () => {
    setIsRenaming(true);
  };
  
  // Cancel renaming account
  const handleCancelRename = () => {
    setIsRenaming(false);
    if (account) {
      setNewName(account.name);
    }
  };
  
  // Save new account name
  const handleSaveRename = () => {
    if (newName.trim() && account) {
      dispatch(renameAccount(accountIndex, newName.trim()));
      setIsRenaming(false);
    }
  };
  
  // Open export private key dialog
  const handleExportPrivateKey = () => {
    setShowPrivateKeyDialog(true);
    setPassword('');
    setPasswordError('');
    setPrivateKey('');
  };
  
  // Close export private key dialog
  const handleClosePrivateKeyDialog = () => {
    setShowPrivateKeyDialog(false);
    setPrivateKey('');
  };
  
  // Verify password and show private key
  const handleShowPrivateKey = async () => {
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    
    try {
      const key = await dispatch(exportPrivateKey(accountIndex, password) as any);
      setPrivateKey(key);
      setPasswordError('');
    } catch (error) {
      setPasswordError('Invalid password');
    }
  };
  
  // Handle copy private key
  const handleCopyPrivateKey = () => {
    if (privateKey) {
      navigator.clipboard.writeText(privateKey);
      setCopiedPrivateKey(true);
      setTimeout(() => setCopiedPrivateKey(false), 3000);
    }
  };
  
  // Open delete account dialog
  const handleOpenDeleteDialog = () => {
    setShowDeleteDialog(true);
  };
  
  // Close delete account dialog
  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
  };
  
  // Delete account
  const handleDeleteAccount = () => {
    dispatch(removeAccount(accountIndex));
    navigate('/');
  };
  
  // Handle transaction click
  const handleTransactionClick = (txId: string) => {
    // Navigate to transaction details
    console.log('View transaction', txId);
  };
  
  // Get transaction icon based on type
  const getTransactionIcon = (type: TransactionType, isIncoming: boolean) => {
    if (type === TransactionType.TRANSFER_PRIVATE || type === TransactionType.TRANSFER_PUBLIC) {
      return isIncoming ? <ReceiveIcon color="primary" /> : <SendIcon color="secondary" />;
    }
    return <WalletIcon />;
  };
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  // If no account is found
  if (!account) {
    return (
      <div className={classes.root}>
        <div className={classes.header}>
          <div className={classes.headerLeft}>
            <IconButton 
              edge="start" 
              className={classes.backButton} 
              onClick={handleBack}
              aria-label="back"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">Account Details</Typography>
          </div>
        </div>
        
        <div className={classes.content}>
          <Paper className={classes.paper}>
            <div className={classes.emptyState}>
              <Typography variant="body1">Account not found</Typography>
            </div>
          </Paper>
        </div>
      </div>
    );
  }
  
  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div className={classes.headerLeft}>
          <IconButton 
            edge="start" 
            className={classes.backButton} 
            onClick={handleBack}
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Account Details</Typography>
        </div>
      </div>
      
      <div className={classes.content}>
        <Paper className={classes.paper}>
          <div className={classes.title}>
            {isRenaming ? (
              <Box display="flex" alignItems="center" width="100%">
                <TextField
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  autoFocus
                />
                <IconButton size="small" onClick={handleSaveRename} disabled={!newName.trim()}>
                  <CheckIcon />
                </IconButton>
                <IconButton size="small" onClick={handleCancelRename}>
                  <ArrowBackIcon />
                </IconButton>
              </Box>
            ) : (
              <>
                <Typography variant="h6">{account.name}</Typography>
                <IconButton size="small" onClick={handleStartRename}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </div>
          
          <div className={classes.addressContainer}>
            <Typography variant="body2" style={{ flex: 1 }}>
              {account.address}
            </Typography>
            <IconButton 
              size="small" 
              onClick={handleCopyAddress} 
              className={classes.copyButton}
            >
              {copiedAddress ? <CheckIcon color="primary" /> : <CopyIcon />}
            </IconButton>
          </div>
          
          <div className={classes.actionButtons}>
            <Button
              variant="contained"
              color="primary"
              className={classes.actionButton}
              onClick={handleSend}
              startIcon={<SendIcon />}
            >
              Send
            </Button>
            
            <Button
              variant="outlined"
              className={classes.actionButton}
              onClick={handleReceive}
              startIcon={<ReceiveIcon />}
            >
              Receive
            </Button>
          </div>
          
          <div className={classes.balanceCard}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <div>
                <div className={classes.balanceLabel}>
                  <VisibilityIcon fontSize="small" />
                  <Typography variant="body2">Public Balance</Typography>
                </div>
                <Typography className={classes.balanceValue}>
                  100.0 ALEO
                </Typography>
              </div>
              
              <div>
                <div className={classes.balanceLabel}>
                  <VisibilityOffIcon fontSize="small" />
                  <Typography variant="body2">Private Balance</Typography>
                </div>
                <Typography className={classes.balanceValue}>
                  50.0 ALEO
                </Typography>
              </div>
            </Box>
            
            <Divider style={{ backgroundColor: 'rgba(255,255,255,0.2)', margin: '8px 0' }} />
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">Total Balance</Typography>
              <Typography variant="h6">150.0 ALEO</Typography>
            </Box>
          </div>
          
          <div className={classes.section}>
            <div className={classes.sectionHeader}>
              <Typography variant="subtitle1" style={{ display: 'flex', alignItems: 'center' }}>
                <HistoryIcon fontSize="small" style={{ marginRight: 8 }} />
                Recent Transactions
              </Typography>
              
              <Button 
                size="small" 
                color="primary"
                onClick={() => navigate('/transactions')}
              >
                View All
              </Button>
            </div>
            
            {transactions.length > 0 ? (
              transactions.map(tx => {
                const isIncoming = tx.toAddress === account.address;
                
                return (
                  <Paper 
                    key={tx.id} 
                    className={classes.transaction}
                    onClick={() => handleTransactionClick(tx.id)}
                  >
                    <div className={classes.transactionLeft}>
                      <div className={classes.transactionIcon}>
                        {getTransactionIcon(tx.type, isIncoming)}
                      </div>
                      <div className={classes.transactionDetails}>
                        <Typography className={classes.transactionTitle}>
                          {isIncoming ? 'Received' : 'Sent'}
                          {tx.type === TransactionType.TRANSFER_PRIVATE ? ' (Private)' : ' (Public)'}
                        </Typography>
                        <Typography className={classes.transactionDate}>
                          {formatDate(tx.timestamp)}
                        </Typography>
                      </div>
                    </div>
                    <Typography className={classes.transactionValue} color={isIncoming ? "primary" : "secondary"}>
                      {isIncoming ? '+' : '-'}{tx.amount} ALEO
                    </Typography>
                  </Paper>
                );
              })
            ) : (
              <div className={classes.emptyState}>
                <Typography variant="body2">No transactions yet</Typography>
              </div>
            )}
          </div>
          
          <Divider className={classes.divider} />
          
          <div className={classes.section}>
            <Typography variant="subtitle1" gutterBottom>
              Account Management
            </Typography>
            
            <Box display="flex" mt={2}>
              <Button
                variant="outlined"
                startIcon={<KeyIcon />}
                onClick={handleExportPrivateKey}
                style={{ marginRight: 8 }}
              >
                Export Private Key
              </Button>
              
              <Button
                variant="outlined"
                className={classes.dangerButton}
                startIcon={<DeleteIcon />}
                onClick={handleOpenDeleteDialog}
                disabled={account.index === 0} // Prevent deleting the first account
              >
                Remove Account
              </Button>
            </Box>
          </div>
        </Paper>
      </div>
      
      {/* Export Private Key Dialog */}
      <Dialog
        open={showPrivateKeyDialog}
        onClose={handleClosePrivateKeyDialog}
        aria-labelledby="private-key-dialog-title"
      >
        <DialogTitle id="private-key-dialog-title">Export Private Key</DialogTitle>
        <DialogContent>
          {!privateKey ? (
            <>
              <DialogContentText>
                Enter your wallet password to reveal this account's private key.
              </DialogContentText>
              
              <TextField
                className={classes.passwordField}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!passwordError}
                helperText={passwordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <div className={classes.warningBox}>
                <WarningIcon className={classes.warningIcon} />
                <Typography variant="body2">
                  <strong>Warning:</strong> Never share your private key with anyone. 
                  Anyone with your private key has full control of your account.
                </Typography>
              </div>
            </>
          ) : (
            <>
              <DialogContentText>
                This is your private key. Never share it with anyone.
              </DialogContentText>
              
              <div className={classes.privateKeyBox}>
                {privateKey}
              </div>
              
              <Box display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={copiedPrivateKey ? <CheckIcon /> : <CopyIcon />}
                  onClick={handleCopyPrivateKey}
                >
                  {copiedPrivateKey ? 'Copied' : 'Copy to Clipboard'}
                </Button>
              </Box>
              
              <div className={classes.warningBox}>
                <WarningIcon className={classes.warningIcon} />
                <Typography variant="body2">
                  <strong>Warning:</strong> Anyone with this key can access and transfer your funds.
                  Do not share it with anyone or enter it on any website.
                </Typography>
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrivateKeyDialog}>
            Close
          </Button>
          {!privateKey && (
            <Button onClick={handleShowPrivateKey} color="primary" disabled={!password}>
              Reveal Private Key
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Delete Account Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Remove Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this account from your wallet?
            This will only remove it from your wallet, not from the blockchain.
          </DialogContentText>
          <DialogContentText style={{ marginTop: 16 }}>
            <strong>Account Name:</strong> {account.name}
            <br />
            <strong>Address:</strong> {account.address.substring(0, 10)}...
          </DialogContentText>
          <div className={classes.warningBox}>
            <WarningIcon className={classes.warningIcon} />
            <Typography variant="body2">
              Make sure you have the private key or recovery phrase backed up
              if you want to access this account in the future.
            </Typography>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} className={classes.dangerButton}>
            Remove Account
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={copiedAddress}
        autoHideDuration={3000}
        onClose={() => setCopiedAddress(false)}
      >
        <Alert onClose={() => setCopiedAddress(false)} severity="success">
          Address copied to clipboard
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AccountDetails;