import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Container
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useState } from 'react';

interface NavBarProps {
  toggleColorMode: () => void;
}

const NavBar = ({ toggleColorMode }: NavBarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <AppBar position="static" color="primary" elevation={3}>
      <Container maxWidth="lg">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ 
              flexGrow: 1, 
              color: 'white', 
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Assessment App
          </Typography>
          
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                onClick={toggleColorMode}
                sx={{ mr: 1 }}
              >
                {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
              >
                <MenuItem 
                  component={RouterLink} 
                  to="/" 
                  onClick={handleClose}
                >
                  Home
                </MenuItem>
                <MenuItem 
                  component={RouterLink} 
                  to="/admin" 
                  onClick={handleClose}
                >
                  Admin Dashboard
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/"
                >
                  Home
                </Button>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/admin"
                >
                  Admin Dashboard
                </Button>
                <IconButton 
                  color="inherit" 
                  onClick={toggleColorMode} 
                  sx={{ ml: 1 }}
                >
                  {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Box>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;