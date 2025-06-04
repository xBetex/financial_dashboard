import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './pages/Dashboard';

// Theme Context
const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90caf9' : '#1976d2',
        light: darkMode ? '#bbdefb' : '#42a5f5',
        dark: darkMode ? '#5e92f3' : '#1565c0',
      },
      secondary: {
        main: darkMode ? '#f48fb1' : '#dc004e',
        light: darkMode ? '#f8bbd9' : '#ff5983',
        dark: darkMode ? '#f06292' : '#c51162',
      },
      success: {
        main: darkMode ? '#66bb6a' : '#2e7d32',
      },
      error: {
        main: darkMode ? '#f44336' : '#d32f2f',
      },
      warning: {
        main: darkMode ? '#ff9800' : '#ed6c02',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#333333',
        secondary: darkMode ? '#b3b3b3' : '#666666',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 700,
        fontSize: '2rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      subtitle1: {
        fontWeight: 500,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: darkMode 
              ? '0 4px 20px rgba(0,0,0,0.3)' 
              : '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 16,
            backdropFilter: 'blur(10px)',
            border: darkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 24px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: darkMode 
                ? '0 4px 12px rgba(144, 202, 249, 0.3)'
                : '0 4px 12px rgba(25, 118, 210, 0.3)',
            },
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: darkMode 
              ? '0 6px 20px rgba(144, 202, 249, 0.4)'
              : '0 6px 20px rgba(25, 118, 210, 0.4)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  }), [darkMode]);

  const themeContextValue = {
    darkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app-container">
          <Dashboard />
        </div>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App; 