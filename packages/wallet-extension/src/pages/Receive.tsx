import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  makeStyles,
  Theme,
  createStyles,
  Paper,
  Typography,
  IconButton,
  Button,
  Divider,
  Box,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Snackbar,
  FormControl,
  Select,
  InputLabel,
  Tooltip
} from '@material-ui/core';
import {
  ArrowBack as ArrowBackIcon,
  FileCopy as CopyIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@material-ui/icons';
import QRCode from 'qrcode.react';
import Alert from '@material-ui/lab/Alert';

import { RootState } from '../state/store';
import { selectActiveAccount, selectAccounts } from '../state/wallet/selectors';
import { AleoAccount } from '../../services/keyring';

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
    },
    subtitle: {
      marginBottom: theme.spacing(3),
      opacity: 0.7,
    },
    qrContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: theme.spacing(4),
    },
    qrCode: {
      padding: theme.spacing(2),
      backgroundColor: '#ffffff',
      borderRadius: theme.shape.borderRadius,
      marginBottom: theme.spacing(3),
      maxWidth: '100%',
      height: 'auto',
    },
    addressContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      width: '100%',
    },
    address: {
      fontFamily: 'monospace',
      fontSize: '0.9rem',
      wordBreak: 'break-all',
      textAlign: 'center',
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing(1.5),
      borderRadius: theme.shape.borderRadius,
      width: '100%',
      position: 'relative',
    },
    actionButtons: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: theme.spacing(2),
      gap: theme.spacing(2),
    },
    actionButton: {
      borderRadius: theme.shape.borderRadius,
      textTransform: 'none',
    },
    divider: {
      margin: theme.spacing(3, 0),
    },
    addressTypeSelector: {
      marginBottom: theme.spacing(3),
    },
    infoSection: {
      marginTop: theme.spacing(3),
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
    },
    infoItem: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: theme.spacing(1),
      '& svg': {
        marginRight: theme.spacing(1),
        marginTop: '3px',
        color: theme.palette.primary.main,
        fontSize: '1rem',
      },
    },
    warningText: {
      color: theme.palette.warning.main,
    },
    accountSelector: {
      marginBottom: theme.spacing(3),
      marginTop: theme.spacing(2),
      width: '100%',
    }
  })
);

// Address type options
enum AddressType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE'
}

const Receive: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  
  // Redux state
  const activeAccount = useSelector(selectActiveAccount);
  const accounts = useSelector(selectAccounts);
  
  // Component state
  const [addressType, setAddressType] = useState<AddressType>(AddressType.PRIVATE);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState<number>(0);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showMenu, setShowMenu] = useState<null | HTMLElement>(null);
  
  // Initialize selected account index when accounts are loaded
  useEffect(() => {
    if (accounts.length > 0 && activeAccount) {
      const activeIndex = accounts.findIndex(acc => acc.address === activeAccount.address);
      if (activeIndex !== -1) {
        setSelectedAccountIndex(activeIndex);
      }
    }
  }, [accounts, activeAccount]);
  
  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShowMenu(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setShowMenu(null);
  };
  
  // Handle back button click
  const handleBack = () => {
    navigate('/');
  };
  
  // Handle address type change
  const handleAddressTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setAddressType(event.target.value as AddressType);
  };
  
  // Handle account change
  const handleAccountChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedAccountIndex(event.target.value as number);
  };
  
  // Get the current address based on selected account and type
  const getCurrentAddress = () => {
    if (!accounts.length || selectedAccountIndex >= accounts.length) {
      return '';
    }
    
    // In this example, we're just using the account address for both types
    // In a real implementation, you might have different address types
    return accounts[selectedAccountIndex].address;
  };
  
  // Handle copy address
  const handleCopyAddress = () => {
    const address = getCurrentAddress();
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 3000);
  };
  
  // Handle share address
  const handleShareAddress = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Aleo Address',
        text: `My Aleo address is: ${getCurrentAddress()}`,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyAddress();
    }
  };
  
  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    if (address.length <= 20) return address;
    
    const prefix = address.substring(0, 10);
    const suffix = address.substring(address.length - 10);
    return `${prefix}...${suffix}`;
  };
  
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
          <Typography variant="h6">Receive ALEO</Typography>
        </div>
        
        <IconButton 
          edge="end"
          aria-label="more"
          onClick={handleMenuOpen}
        >
          <MoreVertIcon />
        </IconButton>
        
        <Menu
          anchorEl={showMenu}
          keepMounted
          open={Boolean(showMenu)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleCopyAddress}>Copy Address</MenuItem>
          <MenuItem onClick={handleShareAddress}>Share Address</MenuItem>
        </Menu>
      </div>
      
      <div className={classes.content}>
        <Paper className={classes.paper}>
          <Typography variant="h6" className={classes.title}>Your Aleo Address</Typography>
          <Typography variant="body2" className={classes.subtitle}>
            Share this address with others to receive ALEO tokens
          </Typography>
          
          {accounts.length > 1 && (
            <FormControl variant="outlined" className={classes.accountSelector}>
              <InputLabel id="account-selector-label">Account</InputLabel>
              <Select
                labelId="account-selector-label"
                value={selectedAccountIndex}
                onChange={handleAccountChange}
                label="Account"
              >
                {accounts.map((account, index) => (
                  <MenuItem key={account.address} value={index}>
                    {account.name} ({formatAddress(account.address)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          <FormControl variant="outlined" className={classes.addressTypeSelector}>
            <InputLabel id="address-type-label">Address Type</InputLabel>
            <Select
              labelId="address-type-label"
              value={addressType}
              onChange={handleAddressTypeChange}
              label="Address Type"
            >
              <MenuItem value={AddressType.PRIVATE}>
                <Box display="flex" alignItems="center">
                  <VisibilityOffIcon fontSize="small" style={{ marginRight: 8 }} />
                  <span>Private Address</span>
                </Box>
              </MenuItem>
              <MenuItem value={AddressType.PUBLIC}>
                <Box display="flex" alignItems="center">
                  <VisibilityIcon fontSize="small" style={{ marginRight: 8 }} />
                  <span>Public Address</span>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
          
          <div className={classes.qrContainer}>
            <QRCode 
              value={getCurrentAddress()}
              size={200}
              level="H"
              includeMargin={true}
              className={classes.qrCode}
            />
            
            <div className={classes.addressContainer}>
              <Typography variant="body2" gutterBottom>
                Address
              </Typography>
              <Tooltip title={getCurrentAddress()}>
                <div className={classes.address}>
                  {getCurrentAddress()}
                </div>
              </Tooltip>
            </div>
          </div>
          
          <div className={classes.actionButtons}>
            <Button
              variant="contained"
              color="primary"
              startIcon={copiedAddress ? <CheckIcon /> : <CopyIcon />}
              onClick={handleCopyAddress}
              className={classes.actionButton}
            >
              {copiedAddress ? 'Copied' : 'Copy'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShareAddress}
              className={classes.actionButton}
            >
              Share
            </Button>
          </div>
          
          <Divider className={classes.divider} />
          
          <div className={classes.infoSection}>
            <Typography variant="subtitle2" gutterBottom>
              Information & Tips
            </Typography>
            
            <div className={classes.infoItem}>
              <CheckIcon fontSize="small" />
              <Typography variant="body2">
                Use this address to receive ALEO tokens or NFTs on the Aleo network.
              </Typography>
            </div>
            
            <div className={classes.infoItem}>
              <CheckIcon fontSize="small" />
              <Typography variant="body2">
                {addressType === AddressType.PRIVATE 
                  ? 'Private transactions hide the amount and details of the transfer.'
                  : 'Public transactions are visible on the Aleo blockchain explorer.'}
              </Typography>
            </div>
            
            <div className={classes.infoItem}>
              <CheckIcon fontSize="small" />
              <Typography variant="body2" className={classes.warningText}>
                Always verify the full address when sharing to avoid errors.
              </Typography>
            </div>
          </div>
        </Paper>
      </div>
      
      <Snackbar
        open={copiedAddress}
        autoHideDuration={3000}
        onClose={() => setCopiedAddress(false)}
      >
        <Alert severity="success">Address copied to clipboard</Alert>
      </Snackbar>
    </div>
  );
};

export default Receive;