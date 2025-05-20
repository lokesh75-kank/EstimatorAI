import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';

function Navbar() {
  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <SecurityIcon sx={{ mr: 2 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Estimator AI
          </Typography>
          <Box>
            <Button
              color="inherit"
              component={RouterLink}
              to="/estimate"
              sx={{ mx: 1 }}
            >
              New Estimate
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/proposal"
              sx={{ mx: 1 }}
            >
              Proposals
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar; 