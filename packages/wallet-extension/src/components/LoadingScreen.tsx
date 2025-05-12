import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { CircularProgress, Typography, Box } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%',
      backgroundColor: theme.palette.background.default,
    },
    logo: {
      marginBottom: theme.spacing(3),
      animation: '$ghostFloat 3s ease-in-out infinite',
      width: 120,
      height: 120,
    },
    title: {
      marginBottom: theme.spacing(1),
      fontWeight: 600,
      color: theme.palette.primary.main,
    },
    subtitle: {
      marginBottom: theme.spacing(4),
      opacity: 0.7,
      maxWidth: '80%',
      textAlign: 'center',
    },
    progress: {
      color: theme.palette.secondary.main,
      marginBottom: theme.spacing(2),
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
    privacy: {
      position: 'absolute',
      bottom: theme.spacing(2),
      fontSize: '0.75rem',
      opacity: 0.5,
      display: 'flex',
      alignItems: 'center',
      '& svg': {
        marginRight: theme.spacing(0.5),
        width: 14,
        height: 14,
      },
    },
  })
);

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Initializing your private wallet...' 
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.logo}>
        {/* Placeholder for the logo - replace with your actual logo */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="60" cy="60" r="50" fill="#8A2BE2" opacity="0.2" />
          <path 
            d="M40 40 C 40 30, 80 30, 80 40 L 80 65 C 80 75, 90 80, 90 90 L 30 90 C 30 80, 40 75, 40 65 Z" 
            fill="#8A2BE2" 
          />
          <circle cx="50" cy="55" r="5" fill="white" />
          <circle cx="70" cy="55" r="5" fill="white" />
        </svg>
      </div>
      
      <Typography variant="h4" className={classes.title}>
        GhostZK
      </Typography>
      
      <Typography variant="subtitle1" className={classes.subtitle}>
        {message}
      </Typography>
      
      <CircularProgress size={32} className={classes.progress} />
      
      <Box className={classes.privacy}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
        </svg>
        <Typography variant="caption">Privacy-Preserving by Design</Typography>
      </Box>
    </div>
  );
};

export default LoadingScreen;