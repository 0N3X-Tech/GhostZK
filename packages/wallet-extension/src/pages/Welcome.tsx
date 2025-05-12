import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Typography, 
  Box, 
  Container, 
  Paper,
  makeStyles,
  Theme,
  createStyles
} from '@material-ui/core';
import { LockOutlined, ImportExportOutlined } from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '100vh',
      padding: theme.spacing(4, 2),
      backgroundColor: theme.palette.background.default,
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      flex: 1,
      justifyContent: 'center',
    },
    header: {
      textAlign: 'center',
      marginBottom: theme.spacing(6),
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: theme.spacing(2),
      animation: '$ghostFloat 3s ease-in-out infinite',
    },
    '@keyframes ghostFloat': {
      '0%': {
        transform: 'translateY(0)',
      },
      '50%': {
        transform: 'translateY(-10px)',
      },
      '100%': {
        transform: 'translateY(0)',
      },
    },
    title: {
      fontWeight: 600,
      marginBottom: theme.spacing(1),
      color: theme.palette.primary.main,
    },
    subtitle: {
      opacity: 0.8,
      maxWidth: '90%',
      margin: '0 auto',
      marginBottom: theme.spacing(4),
    },
    actionContainer: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: 280,
      gap: theme.spacing(2),
    },
    button: {
      padding: theme.spacing(1.5, 2),
      borderRadius: theme.shape.borderRadius,
      fontWeight: 500,
    },
    createButton: {
      backgroundColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    importButton: {
      backgroundColor: 'transparent',
      border: `1px solid ${theme.palette.primary.main}`,
      color: theme.palette.primary.main,
    },
    footer: {
      marginTop: theme.spacing(4),
      textAlign: 'center',
      opacity: 0.5,
      fontSize: '0.75rem',
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(1),
      '& svg': {
        marginRight: theme.spacing(1),
        fontSize: '1rem',
        color: theme.palette.secondary.main,
      },
    },
    featureText: {
      fontSize: '0.85rem',
    },
    featuresContainer: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(4),
      width: '100%',
      maxWidth: 280,
    },
  })
);

const Welcome: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const handleCreateWallet = () => {
    navigate('/create');
  };

  const handleImportWallet = () => {
    navigate('/import');
  };

  // Placeholder for the logo - replace with your actual logo component
  const LogoComponent = () => (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={classes.logo}
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
    <Container className={classes.root}>
      <div className={classes.content}>
        <div className={classes.header}>
          <LogoComponent />
          <Typography variant="h4" className={classes.title}>
            Welcome to GhostZK
          </Typography>
          <Typography variant="subtitle1" className={classes.subtitle}>
            Your privacy-preserving wallet for the Aleo blockchain
          </Typography>
        </div>

        <div className={classes.featuresContainer}>
          <div className={classes.featureItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
            </svg>
            <Typography className={classes.featureText}>Private transactions with zero-knowledge proofs</Typography>
          </div>
          <div className={classes.featureItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
            </svg>
            <Typography className={classes.featureText}>Control your tokens in public or private mode</Typography>
          </div>
          <div className={classes.featureItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23 16v-1.5c0-1.4-1.1-2.5-2.5-2.5S18 13.1 18 14.5V16c-.5 0-1 .5-1 1v4c0 .5.5 1 1 1h5c.5 0 1-.5 1-1v-4c0-.5-.5-1-1-1zm-1 0h-3v-1.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V16zm-6.5-1.5c0-2.8 2.2-5 5-5 .4 0 .7 0 1 .1L23 7.1V3c0-.6-.4-1-1-1H3c-.6 0-1 .4-1 1v18c0 .6.4 1 1 1h12v-4.9c0-1.4.6-2.6 1.5-3.6zM12 18H4v-6h8v6z" />
            </svg>
            <Typography className={classes.featureText}>Self-custody with secure key management</Typography>
          </div>
        </div>

        <div className={classes.actionContainer}>
          <Button
            variant="contained"
            color="primary"
            className={`${classes.button} ${classes.createButton}`}
            startIcon={<LockOutlined />}
            onClick={handleCreateWallet}
            fullWidth
          >
            Create New Wallet
          </Button>
          <Button
            variant="outlined"
            className={`${classes.button} ${classes.importButton}`}
            startIcon={<ImportExportOutlined />}
            onClick={handleImportWallet}
            fullWidth
          >
            Import Existing Wallet
          </Button>
        </div>
      </div>

      <Typography variant="caption" className={classes.footer}>
        GhostZK v0.1.0 • Privacy-Preserving by Design
      </Typography>
    </Container>
  );
};

export default Welcome;