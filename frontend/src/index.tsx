import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#58a6ff',
      light: '#79b8ff',
      dark: '#4c94ff',
    },
    secondary: {
      main: '#f778ba',
      light: '#f89dd4',
      dark: '#db61a2',
    },
    background: {
      default: '#0d1117',
      paper: '#161b22',
    },
    text: {
      primary: '#f0f6fc',
      secondary: '#8b949e',
    },
    divider: '#30363d',
    success: {
      main: '#238636',
      light: '#2ea043',
      dark: '#1a7f37',
    },
    warning: {
      main: '#d29922',
      light: '#e2a336',
      dark: '#bf8700',
    },
    error: {
      main: '#da3633',
      light: '#f85149',
      dark: '#b62324',
    },
    info: {
      main: '#58a6ff',
      light: '#79b8ff',
      dark: '#388bfd',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#f0f6fc',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#f0f6fc',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#f0f6fc',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#f0f6fc',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#f0f6fc',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#f0f6fc',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0d1117',
          color: '#f0f6fc',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(88, 166, 255, 0.3)',
          },
        },
        outlined: {
          borderColor: '#30363d',
          '&:hover': {
            borderColor: '#58a6ff',
            backgroundColor: 'rgba(88, 166, 255, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundColor: '#1c2128',
          border: '1px solid #30363d',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1c2128',
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#30363d',
            },
            '&:hover fieldset': {
              borderColor: '#58a6ff',
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0d1117',
          borderRight: '1px solid #30363d',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#161b22',
          borderBottom: '1px solid #30363d',
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);