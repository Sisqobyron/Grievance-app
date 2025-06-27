import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  alpha,
  useTheme,
  Divider,
  IconButton
} from '@mui/material'
import { motion } from 'framer-motion'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import logoImage from '../assets/logo-transparent-png.png'

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
})

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const theme = useTheme()

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      setIsSubmitting(true)
      try {
        await login(values.email, values.password)
        navigate('/')
      } catch (error) {
        console.error(error)
      } finally {
        setIsSubmitting(false)
      }
    }
  })
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={24}
            sx={{
              p: 5,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Logo and Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >                <Box
                  component="img"
                  src={logoImage}
                  alt="Student Grievance System Logo"
                  sx={{
                    width: 140,
                    height: 140,
                    mb: 3,
                    filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))'
                  }}
                />
              </motion.div>
              
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Welcome Back
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  fontSize: '1.2rem'
                }}
              >
                Sign in to continue to your dashboard
              </Typography>
            </Box>            {/* Form */}
            <Box component="form" onSubmit={formik.handleSubmit}>
              {/* Email Field */}
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    fontSize: '1.1rem',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1.1rem',
                  }
                }}
              />

              {/* Password Field */}
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                slotProps={{
                  input: {
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ mr: 1 }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }
                }}
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    fontSize: '1.1rem',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1.1rem',
                  }
                }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting || !formik.isValid}
                sx={{
                  mt: 4,
                  mb: 3,
                  py: 1.8,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #ccc 0%, #999 100%)',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isSubmitting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={24} color="inherit" />
                    Signing in...
                  </Box>
                ) : (
                  '🚀 Sign In'
                )}
              </Button>

              {/* Divider */}
              <Divider sx={{ my: 3, '&::before, &::after': { borderColor: 'rgba(0,0,0,0.1)' } }}>
                <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                  New to our platform?
                </Typography>
              </Divider>

              {/* Register Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  component={Link}
                  to="/register"
                  variant="outlined"
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  ✨ Create New Account
                </Button>
              </Box>

              {/* Footer Text */}
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  display: 'block', 
                  textAlign: 'center', 
                  mt: 3,
                  fontSize: '0.9rem'
                }}
              >
                Secure access to Student Grievance System
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  )
}