import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  makeStyles,
  Theme,
  createStyles,
  Paper,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Box,
  CircularProgress,
  Chip,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@material-ui/core';
import {
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AccountBalanceWallet as WalletIcon,
  Link as LinkIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@material-ui/icons';

import { RootState } from '../state/store';
import { selectActiveAccount } from '../state/wallet/selectors';
import { ConnectionRequest, DAppPermission } from '../state/dapp/reducer';

// These would be in a real actions file
const approveConnection = (requestId: string, permissions: DAppPermission[]) => {
  return {
    type: 'DAPP_CONNECTION_APPROVE',
    payload: { requestId, approvedPermissions: permissions }
  };
};

const rejectConnection = (requestId: string) => {
  return { type: 'DAPP_CONNECTION_REJECT', payload: requestId };
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
    divider: {
      margin: theme.spacing(3, 0),
    },
    appInfo: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(3),
    },
    appIcon: {
      width: theme.spacing(6),
      height: theme.spacing(6),
      marginRight: theme.spacing(2),
      backgroundColor: theme.palette.background.default,
    },
    appDetails: {
      flex: 1,
    },
    permissionsHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(1),
    },
    permissionsList: {
      backgroundColor: theme.palette.background.default,
      borderRadius: theme.shape.borderRadius,
      marginBottom: theme.spacing(3),
    },
    permissionItem: {
      borderRadius: theme.shape.borderRadius,
      marginBottom: theme.spacing(0.5),
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: theme.spacing(2),
    },
    rejectButton: {
      marginRight: theme.spacing(1),
    },
    approveButton: {
      marginLeft: theme.spacing(1),
    },
    statusContainer: {
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
    urlChip: {
      marginTop: theme.spacing(1),
      backgroundColor: theme.palette.background.default,
    },
    selectAllCheckbox: {
      marginLeft: theme.spacing(-1),
    },
  })
);

enum ConnectionStatus {
  PENDING = 'PENDING',
  CONNECTING = 'CONNECTING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

const ConnectDApp: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Mock active request - in a real app this would come from Redux
  const mockRequest: ConnectionRequest = {
    id: 'request-123',
    name: 'Example DApp',
    url: 'https://example-dapp.com',
    icon: '',
    description: 'A decentralized application for token transfers',
    requestedPermissions: [
      DAppPermission.CONNECT,
      DAppPermission.VIEW_ACCOUNT,
      DAppPermission.VIEW_BALANCE,
      DAppPermission.SIGN_TRANSACTION
    ],
    origin: 'https://example-dapp.com',
    timestamp: Date.now()
  };
  
  // Redux state
  const activeAccount = useSelector(selectActiveAccount);
  
  // Component state
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.PENDING);
  const [error, setError] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<DAppPermission[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  // Initialize selected permissions from requested permissions
  useEffect(() => {
    setSelectedPermissions(mockRequest.requestedPermissions);
    setAllSelected(true);
  }, [mockRequest]);
  
  // Handle back button click
  const handleBack = () => {
    if (status === ConnectionStatus.PENDING) {
      setShowRejectDialog(true);
    } else {
      navigate('/');
    }
  };
  
  // Handle toggle permission
  const handleTogglePermission = (permission: DAppPermission) => {
    const currentIndex = selectedPermissions.indexOf(permission);
    const newPermissions = [...selectedPermissions];
    
    if (currentIndex === -1) {
      newPermissions.push(permission);
    } else {
      newPermissions.splice(currentIndex, 1);
    }
    
    setSelectedPermissions(newPermissions);
    setAllSelected(newPermissions.length === mockRequest.requestedPermissions.length);
  };
  
  // Handle toggle all permissions
  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions([...mockRequest.requestedPermissions]);
    }
    setAllSelected(!allSelected);
  };
  
  // Handle approve connection
  const handleApprove = () => {
    setStatus(ConnectionStatus.CONNECTING);
    
    // Simulate connection approval
    setTimeout(() => {
      try {
        dispatch(approveConnection(mockRequest.id, selectedPermissions));
        setStatus(ConnectionStatus.SUCCESS);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to establish connection');
        setStatus(ConnectionStatus.FAILED);
      }
    }, 1500);
  };
  
  // Handle reject connection
  const handleReject = () => {
    dispatch(rejectConnection(mockRequest.id));
    navigate('/');
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    setShowRejectDialog(false);
  };
  
  // Handle continue to DApp
  const handleContinue = () => {
    // In a real implementation, this would redirect to the DApp
    window.close();
  };
  
  // Get permission label and icon
  const getPermissionDetails = (permission: DAppPermission) => {
    switch (permission) {
      case DAppPermission.CONNECT:
        return {
          label: 'Connect to this wallet',
          description: 'Allow this site to check if you have the wallet installed',
          icon: <LinkIcon />
        };
      case DAppPermission.VIEW_ACCOUNT:
        return {
          label: 'View your account address',
          description: 'Allow this site to see your wallet address',
          icon: <WalletIcon />
        };
      case DAppPermission.VIEW_BALANCE:
        return {
          label: 'View your public balance',
          description: 'Allow this site to check your public token balance',
          icon: <VisibilityIcon />
        };
      case DAppPermission.SIGN_TRANSACTION:
        return {
          label: 'Request transaction signing',
          description: 'Allow this site to request your approval for transactions',
          icon: <SecurityIcon />
        };
      case DAppPermission.SUGGEST_TRANSACTION:
        return {
          label: 'Suggest transactions',
          description: 'Allow this site to suggest transactions',
          icon: <WalletIcon />
        };
      case DAppPermission.AUTO_APPROVE_TRANSACTION:
        return {
          label: 'Auto-approve transactions',
          description: 'Automatically approve transactions from this site (not recommended)',
          icon: <WarningIcon />
        };
      case DAppPermission.ACCESS_RECORDS:
        return {
          label: 'Access private records',
          description: 'Allow this site to view your private token records',
          icon: <VisibilityOffIcon />
        };
      default:
        return {
          label: permission,
          description: 'Unknown permission',
          icon: <WarningIcon />
        };
    }
  };
  
  // Render connection request
  const renderConnectionRequest = () => (
    <>
      <Typography variant="h6" className={classes.title}>Connect to DApp</Typography>
      <Typography variant="body2" className={classes.subtitle}>
        This site is requesting to connect to your wallet
      </Typography>
      
      <div className={classes.appInfo}>
        <Avatar className={classes.appIcon}>
          {mockRequest.icon ? <img src={mockRequest.icon} alt="App Icon" /> : mockRequest.name.charAt(0)}
        </Avatar>
        <div className={classes.appDetails}>
          <Typography variant="h6">{mockRequest.name}</Typography>
          <Chip 
            label={mockRequest.url} 
            size="small" 
            className={classes.urlChip}
            icon={<LinkIcon />}
          />
        </div>
      </div>
      
      <div className={classes.warningBox}>
        <WarningIcon className={classes.warningIcon} />
        <div>
          <Typography variant="body2" gutterBottom>
            <strong>Always verify the URL</strong> before connecting to a DApp.
          </Typography>
          <Typography variant="body2">
            Only connect to sites you trust. Malicious sites can steal your funds.
          </Typography>
        </div>
      </div>
      
      <div className={classes.permissionsHeader}>
        <Typography variant="subtitle2">Requested Permissions</Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={allSelected}
              onChange={handleToggleAll}
              color="primary"
              size="small"
            />
          }
          label="Select All"
          className={classes.selectAllCheckbox}
        />
      </div>
      
      <Paper className={classes.permissionsList} elevation={0}>
        <List disablePadding>
          {mockRequest.requestedPermissions.map((permission, index) => {
            const { label, description, icon } = getPermissionDetails(permission);
            return (
              <React.Fragment key={permission}>
                {index > 0 && <Divider />}
                <ListItem className={classes.permissionItem}>
                  <ListItemIcon>
                    {icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={label} 
                    secondary={description}
                  />
                  <Checkbox
                    edge="end"
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => handleTogglePermission(permission)}
                    color="primary"
                  />
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>
      </Paper>
      
      {activeAccount && (
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>Connect with Account</Typography>
          <Paper variant="outlined" style={{ padding: 16 }}>
            <Typography variant="body2" gutterBottom>
              {activeAccount.name}
            </Typography>
            <Typography variant="caption" style={{ wordBreak: 'break-all' }}>
              {activeAccount.address}
            </Typography>
          </Paper>
        </Box>
      )}
      
      <Divider className={classes.divider} />
      
      <div className={classes.actions}>
        <Button
          variant="outlined"
          color="default"
          onClick={() => setShowRejectDialog(true)}
          startIcon={<ClearIcon />}
          className={classes.rejectButton}
        >
          Reject
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleApprove}
          startIcon={<CheckIcon />}
          className={classes.approveButton}
          disabled={selectedPermissions.length === 0}
        >
          Connect
        </Button>
      </div>
    </>
  );
  
  // Render connection status
  const renderConnectionStatus = () => {
    switch (status) {
      case ConnectionStatus.CONNECTING:
        return (
          <div className={classes.statusContainer}>
            <CircularProgress size={64} className={classes.statusIcon} />
            <Typography variant="h6" gutterBottom>
              Connecting...
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Establishing connection to {mockRequest.name}
            </Typography>
          </div>
        );
      case ConnectionStatus.SUCCESS:
        return (
          <div className={classes.statusContainer}>
            <CheckCircleIcon className={`${classes.statusIcon} ${classes.successIcon}`} />
            <Typography variant="h6" gutterBottom>
              Connection Successful
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              You are now connected to {mockRequest.name}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleContinue}
              style={{ marginTop: 24 }}
            >
              Continue to DApp
            </Button>
          </div>
        );
      case ConnectionStatus.FAILED:
        return (
          <div className={classes.statusContainer}>
            <ErrorIcon className={`${classes.statusIcon} ${classes.errorIcon}`} />
            <Typography variant="h6" gutterBottom>
              Connection Failed
            </Typography>
            <Typography variant="body2" color="error" gutterBottom>
              {error || 'Failed to establish connection'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setStatus(ConnectionStatus.PENDING)}
              style={{ marginTop: 24 }}
            >
              Try Again
            </Button>
          </div>
        );
      default:
        return renderConnectionRequest();
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
        <Typography variant="h6">Connect</Typography>
      </div>
      
      <div className={classes.content}>
        <Paper className={classes.paper}>
          {renderConnectionStatus()}
        </Paper>
      </div>
      
      {/* Reject Connection Dialog */}
      <Dialog
        open={showRejectDialog}
        onClose={handleDialogClose}
        aria-labelledby="reject-dialog-title"
      >
        <DialogTitle id="reject-dialog-title">Reject Connection</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject the connection request from {mockRequest.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleReject} color="secondary">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConnectDApp;