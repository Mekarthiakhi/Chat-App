import React from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState(prev => ({
      errorInfo,
      errorCount: prev.errorCount + 1
    }));
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === 'development';
      
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              py: 4,
              textAlign: 'center'
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                width: '100%',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff'
              }}
            >
              <ErrorOutlineIcon
                sx={{
                  fontSize: 80,
                  mb: 2,
                  opacity: 0.9
                }}
              />
              
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                Oops! Something went wrong
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.95 }}>
                We're sorry for the inconvenience. The application encountered an unexpected error.
              </Typography>

              {isDev && this.state.error && (
                <Box
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    p: 2,
                    borderRadius: 1,
                    mb: 3,
                    textAlign: 'left',
                    maxHeight: 200,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  }}
                >
                  <Typography variant="caption" sx={{ wordBreak: 'break-word', color: '#fff' }}>
                    {this.state.error.toString()}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="inherit"
                  size="large"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleReset}
                  sx={{
                    backgroundColor: '#fff',
                    color: '#667eea',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)'
                    }
                  }}
                >
                  Try Again
                </Button>
                
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={this.handleReload}
                  sx={{
                    borderColor: '#fff',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Reload Page
                </Button>
              </Box>

              {isDev && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 3,
                    opacity: 0.7
                  }}
                >
                  Error #{this.state.errorCount} | Development Mode
                </Typography>
              )}
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}
