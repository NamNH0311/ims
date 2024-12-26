import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, Paper } from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px', // Add some padding
        }}
      >
        <Paper
          elevation={5}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 3,
            backgroundColor: '#fff', // White background for clarity
          }}
        >
          <SentimentVeryDissatisfiedIcon 
            sx={{ 
              fontSize: 100, 
              color: 'warning.main',
              mb: 2 
            }} 
          />
          
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              fontSize: '6rem',
              color: 'warning.main',
              textAlign: 'center',
            }}
          >
            404
          </Typography>

          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 'medium',
              textAlign: 'center',
              mb: 2,
              color: 'text.secondary'
            }}
          >
            Page Not Found
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 4,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            The page you are looking for doesn’t exist or has been moved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackClick}
              sx={{
                minWidth: '160px',
                color: 'warning.main',
                borderColor: 'warning.main',
                '&:hover': {
                  backgroundColor: 'warning.light',
                  borderColor: 'warning.main',
                },
              }}
            >
              Go Back
            </Button>
            <Button
              variant="contained"
              startIcon={<HomeOutlinedIcon />}
              onClick={handleHomeClick}
              sx={{
                minWidth: '160px',
                backgroundColor: 'warning.main',
                '&:hover': {
                  backgroundColor: 'warning.dark',
                },
              }}
            >
              Home Page
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
