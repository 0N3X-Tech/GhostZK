import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  makeStyles,
  Theme,
  createStyles,
  Paper,
  Typography,
  Button,
  Divider,
  IconButton,
  CircularProgress,
  Chip,
  Box,
  Menu,
  MenuItem,
  Fade,
  Tooltip
} from '@material-ui/core';
import {
  Send as SendIcon,
  CallReceived as ReceiveIcon,
  MoreVert as MoreIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  AccountBalanceWallet as WalletIcon,
  Lock as LockIcon,
  Settings as SettingsIcon
} from '@material-ui/icons';

import { RootState } from '../state/store';
import { selectActiveAccount, selectIsUnlocked } from '../state/wallet/selectors';
import { lockWallet } from '../state/wallet/actions';
import { AccountBalance } from '../state/accounts/reducer';
import { Transaction, TransactionStatus, TransactionType } from '../state/transactions/reducer';
import { NetworkStatus } from '../state/network/reducer';
import { PrivacyLevel } from '../state/settings/reducer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.background.default,
      overflow: 'hidden'
    },
    header: {
      padding: theme.spacing(2, 2, 1),
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      display: 'flex',
      alignItems: 'center',
      '& svg': {
        marginRight: theme.spacing(1),
        color: theme.palette.primary.main
      }
    },
    content: {
      flex: 1,
      padding: theme.spacing(0, 2, 2),
      overflowY: 'auto'
    },
    balanceCard: {
      padding: theme.spacing(2),
      marginBottom: theme.spacing(2),
      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
      color: theme.palette.primary.contrastText,
      position: 'relative',
      overflow: 'hidden'
    },
    balanceHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing(2)
    },
    balanceTitle: {
      fontWeight: 500,
      fontSize: '0.875rem'
    },
    balanceAmount: {
      fontWeight: 600,
      fontSize: '1.5rem',
      marginBottom: theme.spacing(0.5)
    },
    balanceType: {
      display: 'flex',
      alignItems: 'center',
      '& svg': {
        fontSize: '0.875rem',
        marginRight: theme.spacing(0.5)
      }
    },
    balanceSubtext: {
      fontSize: '0.75rem',
      opacity: 0.8
    },
    actionButtons: {
      display: 'flex',
      justifyContent: 'space-around',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2)
    },
    actionButton: {
      padding: theme.spacing(1),
      borderRadius: theme.shape.borderRadius,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '45%',
      backgroundColor: theme.palette.background.paper,
      '&:hover': {
        backgroundColor: theme.palette.action.hover
      }
    },
    buttonIcon: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      borderRadius: '50%',
      padding: theme.spacing(1),
      marginBottom: theme.spacing(0.5)
    },
    buttonText: {
      fontSize: '0.75rem',
      fontWeight: 500
    },
    sectionTitle: {
      fontWeight: 500,
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    transaction: {
      padding: theme.spacing(1.5),
      marginBottom: theme.spacing(1),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: theme.palette.action.hover
      }
    },
    transactionLeft: {
      display: 'flex',
      alignItems: 'center'
    },
    transactionIcon: {
      borderRadius: '50%',
      padding: theme.spacing(1),
      marginRight: theme.spacing(1.5),
      backgroundColor: theme.palette.background.default
    },
    transactionDetails: {
      display: 'flex',
      flexDirection: 'column'
    },
    transactionTitle: {
      fontWeight: 500,
      fontSize: '0.875rem'
    },
    transactionDate: {
      fontSize: '0.75rem',
      opacity: 0.7
    },
    transactionAmount: {
      fontWeight: 500
    },
    transactionStatus: {
      marginTop: theme.spacing(0.5),
      fontSize: '0.65rem'
    },
    noTransactions: {
      textAlign: 'center',
      padding: theme.spacing(3),
      opacity: 0.6
    },
    privacyIndicator: {
      position: 'absolute',
      bottom: theme.spacing(1),
      right: theme.spacing(1),
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0.25, 0.75),
      borderRadius: theme.shape.borderRadius,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      fontSize: '0.65rem'
    },
    privacyIcon: {
      fontSize: '0.75rem',
      marginRight: theme.spacing(0.5)
    },
    footer: {
      padding: theme.spacing(1.5),
      borderTop: `1px solid ${theme.palette.divider}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    footerLeft: {
      display: 'flex',
      alignItems: 'center'
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      marginRight: theme.spacing(1)
    },
    statusConnected: {
      backgroundColor: '#4caf50'
    },
    statusDisconnected: {
      backgroundColor: '#f44336'
    },
    networkName: {
      fontSize: '0.75rem',
      opacity: 0.7
    },
    hiddenBalance: {
      letterSpacing: 2,
      fontFamily: 'monospace'
    },
    addressChip: {
      fontSize: '0.7rem',
      height: 22,
      marginTop: theme.spacing(0.5)
    },
    refreshButton: {
      padding: 4
    },
    emptyStateIcon: {
      fontSize: '3rem',
      opacity: 0.2,
      marginBottom: theme.spacing(1)
    }
  })
);

const Dashboard: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // State
  const [hideBalance, setHideBalance] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Selectors
  const account = useSelector(selectActiveAccount);
  const isUnlocked = useSelector(selectIsUnlocked);
  const networkStatus = useSelector((state: RootState) => state.network.status);
  const currentNetwork = useSelector((state: RootState) => {
    const networkId = state.network.currentNetworkId;
    return state.network.networks[networkId];
  });
  const transactions = useSelector((state: RootState) => {
    const txIds = state.transactions.recentTransactions.slice(0, 5);
    return txIds.map(id => state.transactions.transactions[id]).filter(Boolean);
  });
  const balances = useSelector((state: RootState) => {
    if (!account) return null;
    return state.accounts.balances[account.address];
  });
  const privacyLevel = useSelector((state: RootState) => state.settings.privacyLevel);
  const hideSensitiveData = useSelector((state: RootState) => state.settings.hideSensitiveData);
  
  // Effects
  useEffect(() => {
    if (!isUnlocked) {
      navigate('/unlock');
    }
  }, [isUnlocked, navigate]);
  
  useEffect(() => {
    setHideBalance(hideSensitiveData);
  }, [hideSensitiveData]);
  
  // Handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleSend = () => {
    navigate('/send');
  };
  
  const handleReceive = () => {
    navigate('/receive');
  };
  
  const handleLock = () => {
    dispatch(lockWallet() as any);
    navigate('/unlock');
  };
  
  const handleSettings = () => {
    navigate('/settings');
  };
  
  const handleRefresh = () => {
    // TODO: Implement refresh logic
    console.log('Refreshing balances and transactions');
  };
  
  const handleTransactionClick = (txId: string) => {
    // TODO: Navigate to transaction details
    console.log('View transaction details', txId);
  };
  
  const formatBalance = (balance: string) => {
    return hideBalance ? '••••••' : parseFloat(balance).toLocaleString();
  };
  
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 5)}...${address.substring(address.length - 4)}`;
  };
  
  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.TRANSFER_PUBLIC:
      case TransactionType.TRANSFER_PRIVATE:
        return <SendIcon style={{ color: '#f44336' }} />;
      case TransactionType.SHIELD:
        return <VisibilityOffIcon style={{ color: '#9c27b0' }} />;
      case TransactionType.UNSHIELD:
        return <VisibilityIcon style={{ color: '#2196f3' }} />;
      default:
        return <WalletIcon style={{ color: '#4caf50' }} />;
    }
  };
  
  const getTransactionTitle = (tx: Transaction) => {
    switch (tx.type) {
      case TransactionType.TRANSFER_PUBLIC:
        return 'Public Transfer';
      case TransactionType.TRANSFER_PRIVATE:
        return 'Private Transfer';
      case TransactionType.SHIELD:
        return 'Shield (Public → Private)';
      case TransactionType.UNSHIELD:
        return 'Unshield (Private → Public)';
      default:
        return 'Transaction';
    }
  };
  
  const getStatusChipColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.CONFIRMED:
        return '#4caf50';
      case TransactionStatus.PENDING:
      case TransactionStatus.SUBMITTING:
      case TransactionStatus.GENERATING_PROOF:
        return '#ff9800';
      case TransactionStatus.FAILED:
      case TransactionStatus.REJECTED:
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  const getPrivacyLevelLabel = (level: PrivacyLevel) => {
    switch (level) {
      case PrivacyLevel.MAXIMUM:
        return 'Maximum Privacy';
      case PrivacyLevel.HIGH:
        return 'High Privacy';
      case PrivacyLevel.STANDARD:
      default:
        return 'Standard Privacy';
    }
  };
  
  // Render guard
  if (!account || !balances) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div className={classes.headerTitle}>
          <WalletIcon />
          <Typography variant="h6">GhostZK</Typography>
        </div>
        <IconButton aria-label="menu" onClick={handleMenuOpen}>
          <MoreIcon />
        </IconButton>
        <Menu
          anchorEl={menuAnchorEl}
          keepMounted
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          TransitionComponent={Fade}
        >
          <MenuItem onClick={handleSettings}>
            <SettingsIcon fontSize="small" style={{ marginRight: 8 }} />
            Settings
          </MenuItem>
          <MenuItem onClick={handleLock}>
            <LockIcon fontSize="small" style={{ marginRight: 8 }} />
            Lock Wallet
          </MenuItem>
        </Menu>
      </div>
      
      <div className={classes.content}>
        <Paper className={classes.balanceCard}>
          <div className={classes.balanceHeader}>
            <Typography className={classes.balanceTitle}>Total Balance</Typography>
            <IconButton size="small" onClick={() => setHideBalance(!hideBalance)}>
              {hideBalance ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          </div>
          
          <Typography className={classes.balanceAmount}>
            {formatBalance(
              (parseFloat(balances.publicBalance) + parseFloat(balances.privateBalance)).toString()
            )} ALEO
          </Typography>
          
          <Chip
            label={truncateAddress(account.address)}
            size="small"
            className={classes.addressChip}
          />
          
          <Box display="flex" mt={2} justifyContent="space-between">
            <div>
              <div className={classes.balanceType}>
                <VisibilityIcon className={classes.privacyIcon} />
                <Typography variant="caption">Public</Typography>
              </div>
              <Typography className={classes.balanceAmount}>
                {formatBalance(balances.publicBalance)} ALEO
              </Typography>
            </div>
            
            <div>
              <div className={classes.balanceType}>
                <VisibilityOffIcon className={classes.privacyIcon} />
                <Typography variant="caption">Private</Typography>
              </div>
              <Typography className={classes.balanceAmount}>
                {formatBalance(balances.privateBalance)} ALEO
              </Typography>
            </div>
          </Box>
          
          <div className={classes.privacyIndicator}>
            <VisibilityOffIcon className={classes.privacyIcon} />
            <Typography variant="caption">{getPrivacyLevelLabel(privacyLevel)}</Typography>
          </div>
        </Paper>
        
        <div className={classes.actionButtons}>
          <Button className={classes.actionButton} onClick={handleSend}>
            <span className={classes.buttonIcon}>
              <SendIcon fontSize="small" />
            </span>
            <Typography className={classes.buttonText}>Send</Typography>
          </Button>
          
          <Button className={classes.actionButton} onClick={handleReceive}>
            <span className={classes.buttonIcon}>
              <ReceiveIcon fontSize="small" />
            </span>
            <Typography className={classes.buttonText}>Receive</Typography>
          </Button>
        </div>
        
        <div className={classes.sectionTitle}>
          <Typography variant="subtitle2">Recent Transactions</Typography>
          <Tooltip title="Refresh">
            <IconButton size="small" className={classes.refreshButton} onClick={handleRefresh}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
        
        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <Paper 
              key={tx.id} 
              className={classes.transaction}
              onClick={() => handleTransactionClick(tx.id)}
            >
              <div className={classes.transactionLeft}>
                <div className={classes.transactionIcon}>
                  {getTransactionIcon(tx.type)}
                </div>
                <div className={classes.transactionDetails}>
                  <Typography className={classes.transactionTitle}>
                    {getTransactionTitle(tx)}
                  </Typography>
                  <Typography className={classes.transactionDate}>
                    {formatDate(tx.timestamp)}
                  </Typography>
                  <div className={classes.transactionStatus}>
                    <Chip
                      label={tx.status}
                      size="small"
                      style={{
                        backgroundColor: getStatusChipColor(tx.status),
                        color: 'white',
                        height: 16,
                        fontSize: '0.6rem'
                      }}
                    />
                  </div>
                </div>
              </div>
              <Typography className={classes.transactionAmount}>
                {tx.type === TransactionType.TRANSFER_PUBLIC || tx.type === TransactionType.TRANSFER_PRIVATE 
                  ? '-' : tx.type === TransactionType.SHIELD || tx.type === TransactionType.UNSHIELD 
                  ? '⟷' : '+'}{' '}
                {tx.amount ? (hideBalance ? '••••••' : tx.amount) : ''} ALEO
              </Typography>
            </Paper>
          ))
        ) : (
          <Paper className={classes.noTransactions}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <WalletIcon className={classes.emptyStateIcon} />
              <Typography variant="body2">No transactions yet</Typography>
              <Typography variant="caption">
                Your transaction history will appear here
              </Typography>
            </Box>
          </Paper>
        )}
      </div>
      
      <div className={classes.footer}>
        <div className={classes.footerLeft}>
          <div 
            className={`${classes.statusDot} ${
              networkStatus === NetworkStatus.CONNECTED 
                ? classes.statusConnected 
                : classes.statusDisconnected
            }`} 
          />
          <Typography className={classes.networkName}>
            {currentNetwork.name}
          </Typography>
        </div>
        <Typography variant="caption" color="textSecondary">
          v0.1.0
        </Typography>
      </div>
    </div>
  );
};

export default Dashboard;