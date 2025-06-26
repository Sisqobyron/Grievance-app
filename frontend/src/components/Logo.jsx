import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const LogoContainer = styled(Box)(({ theme, size = 'medium' }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: size === 'small' ? theme.spacing(1) : theme.spacing(1.5),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const LogoIcon = styled('div')(({ theme, size = 'medium' }) => {
  const dimensions = {
    small: '32px',
    medium: '48px',
    large: '64px',
    xl: '96px'
  };
  
  return {
    width: dimensions[size],
    height: dimensions[size],
    position: 'relative',
    flexShrink: 0,
    
    // Outer circle with gradient
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: theme.shadows[3],
    
    // Inner eye shape
    '&::before': {
      content: '""',
      position: 'absolute',
      width: '70%',
      height: '45%',
      background: theme.palette.background.paper,
      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
      top: '27.5%',
      left: '15%',
    },
    
    // Globe/iris
    '&::after': {
      content: '""',
      position: 'absolute',
      width: '24px',
      height: '24px',
      background: `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.info.light})`,
      borderRadius: '50%',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      border: `2px solid ${theme.palette.background.paper}`,
      
      // Grid lines for globe effect
      backgroundImage: `
        linear-gradient(0deg, transparent 40%, ${theme.palette.background.paper} 40%, ${theme.palette.background.paper} 60%, transparent 60%),
        linear-gradient(90deg, transparent 40%, ${theme.palette.background.paper} 40%, ${theme.palette.background.paper} 60%, transparent 60%)
      `,
    }
  };
});

const LogoText = styled(Typography)(({ theme, size = 'medium' }) => {
  const fontSizes = {
    small: { main: '1rem', sub: '0.75rem' },
    medium: { main: '1.5rem', sub: '0.875rem' },
    large: { main: '2rem', sub: '1rem' },
    xl: { main: '2.5rem', sub: '1.125rem' }
  };
  
  return {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 600,
    fontSize: fontSizes[size].main,
    color: theme.palette.text.primary,
    lineHeight: 1.2,
    
    '& .logo-subtitle': {
      display: 'block',
      fontSize: fontSizes[size].sub,
      fontWeight: 400,
      color: theme.palette.primary.main,
      marginTop: '-2px',
    }
  };
});

const Logo = ({ 
  size = 'medium', 
  showText = true, 
  onClick,
  variant = 'full' // 'icon', 'text', 'full'
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <LogoContainer size={size} onClick={handleClick}>
      {(variant === 'icon' || variant === 'full') && (
        <LogoIcon size={size} />
      )}
      
      {showText && (variant === 'text' || variant === 'full') && (
        <LogoText size={size} variant="h6" component="div">
          Student
          <span className="logo-subtitle">Grievance System</span>
        </LogoText>
      )}
    </LogoContainer>
  );
};

export default Logo;
