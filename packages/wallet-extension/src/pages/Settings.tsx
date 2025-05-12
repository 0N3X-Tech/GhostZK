import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  makeStyles,
  Theme,
  createStyles,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Switch,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Slider,
  Box,
  Collapse,
  Snackbar
} from '@material-ui/core';
import {
  ArrowBack as ArrowBackIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  BrightnessAuto as SystemThemeIcon,
  Security as SecurityIcon,
  LockClock as LockClockIcon,
  Language as LanguageIcon,
  AccountBalanceWallet as WalletIcon,
  Code as CodeIcon,
  VpnKey as VpnKeyIcon,
  MonetizationOn as CurrencyIcon,
  Lock as LockIcon,
  NetworkCheck as NetworkIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  VisibilityOff as VisibilityOffIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CloudUpload as BackupIcon
} from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';

import { RootState } from '../state/store';
import { Theme as ThemeType, Currency, Language, PrivacyLevel } from '../state/settings/reducer';
import { NetworkType } from '../state/network/reducer';
import { lockWallet } from '../state/wallet/actions';

// Mock actions for settings - replace with actual actions
const updateSettings = (settings: any) => {
  return { type: 'SETTINGS_UPDATE', payload: settings };
};

const setTheme = (theme: ThemeType) => {
  return { type: 'SETTINGS_SET_THEME', payload: theme };
};

const toggleDeveloperMode = () => {
  return { type: 'SETTINGS_TOGGLE_DEVELOPER_MODE' };
};

const toggleAdvancedMode = () => {
  return { type: 'SETTINGS_TOGGLE_ADVANCED_MODE' };
};

const setAutoLockTimeout = (minutes: number) => {
  return { type: 'SETTINGS_SET_AUTO_LOCK_TIMEOUT', payload: minutes };
};

const setPrivacyLevel = (level: PrivacyLevel) => {
  return { type: 'SETTINGS_SET_PRIVACY_LEVEL', payload: level };
};

const togglePasswordRequirement = () => {
  return { type: 'SETTINGS_TOGGLE_PASSWORD_REQUIREMENT' };
};

const toggleSensitiveData = () => {
  return { type: 'SETTINGS_TOGGLE_SENSITIVE_DATA' };
};

const setNetwork = (networkId: string) => {
  return { type: 'NETWORK_SET_CURRENT', payload: networkId };
};

// Mocked export mnemonic action
const exportMnemonic = (password: string) => {
  return (dispatch: any) => {
    return Promise.resolve('mock seed phrase...');
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
    title: {
      fontWeight: 600,
      marginBottom: theme.spacing(1),
    },
    sectionTitle: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: theme.palette.text.secondary,
      padding: theme.spacing(1, 2, 0),
    },
    settingsList: {
      padding: 0,
    },
    listItem: {
      borderRadius: theme.shape.borderRadius,
      marginBottom: theme.spacing(0.5),
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    listItemWithSubmenu: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      marginBottom: 0,
    },
    listItemIcon: {
      minWidth: 40,
    },
    formControl: {
      minWidth: 120,
    },
    divider: {
      margin: theme.spacing(2, 0),
    },
    buttonDivider: {
      margin: theme.spacing(1, 0),
    },
    dangerButton: {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.error.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.error.dark,
      },
    },
    warningItem: {
      color: theme.palette.warning.main,
    },
    dangerItem: {
      color: theme.palette.error.main,
    },
    versionInfo: {
      textAlign: 'center',
      padding: theme.spacing(2),
      opacity: 0.7,
      fontSize: '0.75rem',
    },
    slider: {
      width: '90%',
      marginLeft: theme.spacing(1),
    },
    sliderValueLabel: {
      marginLeft: theme.spacing(2),
      minWidth: 40,
    },
    subMenu: {
      paddingLeft: theme.spacing(6),
      backgroundColor: theme.palette.background.default,
      borderBottomLeftRadius: theme.shape.borderRadius,
      borderBottomRightRadius: theme.shape.borderRadius,
      marginBottom: theme.spacing(0.5),
    },
    backupNote: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      padding: theme.spacing(1.5),
      borderRadius: theme.shape.borderRadius,
      marginTop: theme.spacing(1),
      fontSize: '0.75rem',
    },
    warningIcon: {
      fontSize: '1rem',
      marginRight: theme.spacing(0.5),
      verticalAlign: 'middle',
      color: theme.palette.warning.main,
    },
  })
);

const Settings: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const settings = useSelector((state: RootState) => state.settings);
  const networks = useSelector((state: RootState) => state.network.networks);
  const currentNetworkId = useSelector((state: RootState) => state.network.currentNetworkId);
  
  // Local state
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [backupPassword, setBackupPassword] = useState('');
  const [backupPasswordError, setBackupPasswordError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    privacy: false,
    developer: false,
  });
  
  // Handle back button click
  const handleBack = () => {
    navigate('/');
  };
  
  // Toggle expansion of a section
  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  // Handle theme change
  const handleThemeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    dispatch(setTheme(event.target.value as ThemeType));
  };
  
  // Handle auto-lock timeout change
  const handleAutoLockChange = (event: any, newValue: number | number[]) => {
    dispatch(setAutoLockTimeout(newValue as number));
  };
  
  // Handle privacy level change
  const handlePrivacyLevelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    dispatch(setPrivacyLevel(event.target.value as PrivacyLevel));
  };
  
  // Handle network change
  const handleNetworkChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    dispatch(setNetwork(event.target.value as string));
  };
  
  // Toggle developer mode
  const handleToggleDeveloperMode = () => {
    dispatch(toggleDeveloperMode());
  };
  
  // Toggle advanced mode
  const handleToggleAdvancedMode = () => {
    dispatch(toggleAdvancedMode());
  };
  
  // Toggle password requirement for transactions
  const handleTogglePasswordRequirement = () => {
    dispatch(togglePasswordRequirement());
  };
  
  // Toggle hiding sensitive data
  const handleToggleSensitiveData = () => {
    dispatch(toggleSensitiveData());
  };
  
  // Open backup dialog
  const handleOpenBackupDialog = () => {
    setShowBackupDialog(true);
    setBackupPassword('');
    setBackupPasswordError('');
    setSeedPhrase('');
  };
  
  // Close backup dialog
  const handleCloseBackupDialog = () => {
    setShowBackupDialog(false);
    setSeedPhrase('');
  };
  
  // Export recovery phrase
  const handleExportRecoveryPhrase = async () => {
    if (!backupPassword) {
      setBackupPasswordError('Password is required');
      return;
    }
    
    try {
      const mnemonic = await dispatch(exportMnemonic(backupPassword) as any);
      setSeedPhrase(mnemonic);
      setBackupPasswordError('');
    } catch (error) {
      setBackupPasswordError('Invalid password');
    }
  };
  
  // Format auto-lock value label
  const formatAutoLockValue = (value: number) => {
    if (value === 0) return 'Never';
    if (value === 1) return '1 minute';
    return `${value} minutes`;
  };
  
  // Lock wallet
  const handleLockWallet = () => {
    dispatch(lockWallet() as any);
    navigate('/unlock');
  };
  
  // Open delete wallet dialog
  const handleOpenDeleteDialog = () => {
    setShowDeleteDialog(true);
    setDeleteConfirmText('');
  };
  
  // Close delete wallet dialog
  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
  };
  
  // Delete wallet
  const handleDeleteWallet = () => {
    // Implement wallet deletion logic
    setShowDeleteDialog(false);
    // Show confirmation
    setSnackbarMessage('Wallet deleted successfully');
    setShowSnackbar(true);
    // Navigate to welcome screen
    setTimeout(() => navigate('/welcome'), 1500);
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
        <Typography variant="h6">Settings</Typography>
      </div>
      
      <div className={classes.content}>
        <Typography variant="subtitle2" className={classes.sectionTitle}>
          Display
        </Typography>
        <Paper>
          <List className={classes.settingsList}>
            <ListItem className={classes.listItem}>
              <ListItemIcon className={classes.listItemIcon}>
                {settings.theme === ThemeType.DARK ? (
                  <DarkModeIcon />
                ) : settings.theme === ThemeType.LIGHT ? (
                  <LightModeIcon />
                ) : (
                  <SystemThemeIcon />
                )}
              </ListItemIcon>
              <ListItemText primary="Theme" />
              <ListItemSecondaryAction>
                <FormControl className={classes.formControl}>
                  <Select
                    value={settings.theme}
                    onChange={handleThemeChange}
                    variant="outlined"
                    margin="dense"
                  >
                    <MenuItem value={ThemeType.DARK}>Dark</MenuItem>
                    <MenuItem value={ThemeType.LIGHT}>Light</MenuItem>
                    <MenuItem value={ThemeType.SYSTEM}>System</MenuItem>
                  </Select>
                </FormControl>
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem className={classes.listItem}>
              <ListItemIcon className={classes.listItemIcon}>
                <LanguageIcon />
              </ListItemIcon>
              <ListItemText primary="Language" />
              <ListItemSecondaryAction>
                <FormControl className={classes.formControl}>
                  <Select
                    value={settings.language}
                    variant="outlined"
                    margin="dense"
                    disabled // Not implemented yet
                  >
                    <MenuItem value={Language.EN}>English</MenuItem>
                  </Select>
                </FormControl>
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem className={classes.listItem}>
              <ListItemIcon className={classes.listItemIcon}>
                <CurrencyIcon />
              </ListItemIcon>
              <ListItemText primary="Currency" />
              <ListItemSecondaryAction>
                <FormControl className={classes.formControl}>
                  <Select
                    value={settings.currency}
                    variant="outlined"
                    margin="dense"
                    disabled // Not implemented yet
                  >
                    <MenuItem value={Currency.USD}>USD</MenuItem>
                  </Select>
                </FormControl>
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem className={classes.listItem}>
              <ListItemIcon className={classes.listItemIcon}>
                <VisibilityOffIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Hide Sensitive Data" 
                secondary="Hide balances and transaction amounts"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.hideSensitiveData}
                  onChange={handleToggleSensitiveData}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Paper>
        
        <Typography variant="subtitle2" className={classes.sectionTitle}>
          Network
        </Typography>
        <Paper>
          <List className={classes.settingsList}>
            <ListItem className={classes.listItem}>
              <ListItemIcon className={classes.listItemIcon}>
                <NetworkIcon />
              </ListItemIcon>
              <ListItemText primary="Network" />
              <ListItemSecondaryAction>
                <FormControl className={classes.formControl}>
                  <Select
                    value={currentNetworkId}
                    onChange={handleNetworkChange}
                    variant="outlined"
                    margin="dense"
                  >
                    {Object.values(networks).map((network) => (
                      <MenuItem key={network.id} value={network.id}>
                        {network.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </ListItemSecondaryAction>
            </ListItem>
            
            {/* Network settings could be expanded here */}
          </List>
        </Paper>
        
        <Typography variant="subtitle2" className={classes.sectionTitle}>
          Security
        </Typography>
        <Paper>
          <List className={classes.settingsList}>
            <ListItem className={classes.listItem}>
              <ListItemIcon className={classes.listItemIcon}>
                <LockClockIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Auto-Lock Timer" 
                secondary={formatAutoLockValue(settings.autoLockTimeout)}
              />
              <ListItemSecondaryAction style={{ width: '60%' }}>
                <Box display="flex" alignItems="center">
                  <Slider
                    value={settings.autoLockTimeout}
                    onChange={handleAutoLockChange}
                    step={1}
                    marks
                    min={0}
                    max={60}
                    className={classes.slider}
                  />
                  <Typography variant="caption" className={classes.sliderValueLabel}>
                    {formatAutoLockValue(settings.autoLockTimeout)}
                  </Typography>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem className={classes.listItem}>
              <ListItemIcon className={classes.listItemIcon}>
                <VpnKeyIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Transaction Password" 
                secondary="Require password for transactions"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.requirePasswordForTransactions}
                  onChange={handleTogglePasswordRequirement}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem 
              button 
              className={`${classes.listItem} ${expandedSections.privacy ? classes.listItemWithSubmenu : ''}`}
              onClick={() => toggleSection('privacy')}
            >
              <ListItemIcon className={classes.listItemIcon}>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText primary="Privacy Level" secondary={settings.privacyLevel} />
              <ListItemSecondaryAction>
                {expandedSections.privacy ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemSecondaryAction>
            </ListItem>
            
            <Collapse in={expandedSections.privacy} timeout="auto" unmountOnExit>
              <Box className={classes.subMenu}>
                <FormControl className={classes.formControl} fullWidth margin="dense">
                  <Select
                    value={settings.privacyLevel}
                    onChange={handlePrivacyLevelChange}
                    variant="outlined"
                  >
                    <MenuItem value={PrivacyLevel.STANDARD}>Standard</MenuItem>
                    <MenuItem value={PrivacyLevel.HIGH}>High</MenuItem>
                    <MenuItem value={PrivacyLevel.MAXIMUM}>Maximum</MenuItem>
                  </Select>
                  <Typography variant="caption" style={{ marginTop: 8 }}>
                    {settings.privacyLevel === PrivacyLevel.STANDARD && 
                      "Standard level balances private and public transactions."}
                    {settings.privacyLevel === PrivacyLevel.HIGH && 
                      "High level uses private transactions by default when possible."}
                    {settings.privacyLevel === PrivacyLevel.MAXIMUM && 
                      "Maximum level enforces privacy for all operations."}
                  </Typography>
                </Box>
              </Box>
            </Collapse>
            
            <ListItem
              button
              className={classes.listItem}
              onClick={handleOpenBackupDialog}
            >
              <ListItemIcon className={classes.listItemIcon}>
                <BackupIcon />
              </ListItemIcon>
              <ListItemText primary="Backup Recovery Phrase" />
            </ListItem>
            
            <ListItem
              button
              className={classes.listItem}
              onClick={handleLockWallet}
            >
              <ListItemIcon className={classes.listItemIcon}>
                <LockIcon />
              </ListItemIcon>
              <ListItemText primary="Lock Wallet" />
            </ListItem>
          </List>
        </Paper>
        
        <Typography variant="subtitle2" className={classes.sectionTitle}>
          Advanced
        </Typography>
        <Paper>
          <List className={classes.settingsList}>
            <ListItem className={classes.listItem}>
              <ListItemIcon className={classes.listItemIcon}>
                <CodeIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Advanced Mode" 
                secondary="Enable advanced features"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.advancedMode}
                  onChange={handleToggleAdvancedMode}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem 
              button 
              className={`${classes.listItem} ${expandedSections.developer ? classes.listItemWithSubmenu : ''}`}
              onClick={() => toggleSection('developer')}
            >
              <ListItemIcon className={classes.listItemIcon}>
                <CodeIcon />
              </ListItemIcon>
              <ListItemText primary="Developer Mode" />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.developerMode}
                  onChange={handleToggleDeveloperMode}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <Collapse in={expandedSections.developer && settings.developerMode} timeout="auto" unmountOnExit>
              <Box className={classes.subMenu}>
                <Typography variant="body2" gutterBottom>
                  Developer settings will be available in future updates.
                </Typography>
              </Box>
            </Collapse>
            
            <Divider className={classes.buttonDivider} />
            
            <ListItem
              button
              className={`${classes.listItem} ${classes.dangerItem}`}
              onClick={handleOpenDeleteDialog}
            >
              <ListItemIcon className={classes.listItemIcon}>
                <DeleteIcon color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Delete Wallet" 
                primaryTypographyProps={{ color: 'error' }}
              />
            </ListItem>
          </List>
        </Paper>
        
        <div className={classes.versionInfo}>
          <Typography variant="caption">
            GhostZK v0.1.0
          </Typography>
        </div>
      </div>
      
      {/* Backup Recovery Phrase Dialog */}
      <Dialog
        open={showBackupDialog}
        onClose={handleCloseBackupDialog}
        aria-labelledby="backup-dialog-title"
      >
        <DialogTitle id="backup-dialog-title">Backup Recovery Phrase</DialogTitle>
        <DialogContent>
          {!seedPhrase ? (
            <>
              <DialogContentText>
                Enter your password to reveal your recovery phrase.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                value={backupPassword}
                onChange={(e) => setBackupPassword(e.target.value)}
                error={!!backupPasswordError}
                helperText={backupPasswordError}
              />
              <div className={classes.backupNote}>
                <WarningIcon className={classes.warningIcon} />
                <Typography variant="caption">
                  Warning: Never share your recovery phrase with anyone. Anyone with this phrase can access your funds.
                </Typography>
              </div>
            </>
          ) : (
            <>
              <DialogContentText>
                This is your recovery phrase. Write it down and keep it in a secure location.
              </DialogContentText>
              <Paper 
                elevation={0} 
                style={{ 
                  padding: 16, 
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  margin: '16px 0',
                  fontFamily: 'monospace',
                  wordBreak: 'break-word'
                }}
              >
                {seedPhrase}
              </Paper>
              <div className={classes.backupNote}>
                <WarningIcon className={classes.warningIcon} />
                <Typography variant="caption">
                  Warning: Never share your recovery phrase with anyone. Anyone with this phrase can access your funds.
                </Typography>
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBackupDialog} color="default">
            Close
          </Button>
          {!seedPhrase && (
            <Button onClick={handleExportRecoveryPhrase} color="primary">
              Reveal Phrase
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Delete Wallet Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Wallet</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Warning: This action will permanently delete your wallet from this device. 
            Unless you have backed up your recovery phrase, this action is irreversible 
            and will result in loss of access to your funds.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Type 'delete' to confirm"
            fullWidth
            variant="outlined"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="default">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteWallet} 
            className={classes.dangerButton}
            disabled={deleteConfirmText !== 'delete'}
          >
            Delete Wallet
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert onClose={() => setShowSnackbar(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Settings;