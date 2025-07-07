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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
  useTheme,
  Fade,
  Chip,
  LinearProgress
} from '@mui/material'
import { motion } from 'framer-motion'
import logoImage from '../assets/logo-transparent-png.png'

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain an uppercase letter')
    .matches(/[a-z]/, 'Must contain a lowercase letter')
    .matches(/[0-9]/, 'Must contain a number')
    .matches(/[@$!%*?&#]/, 'Must contain a special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  role: Yup.string().required('Role is required'),
  department: Yup.string().required('Department is required'),
  program: Yup.string().when('role', {
    is: 'student',
    then: () => Yup.string().required('Program is required'),
  }),
  matricule: Yup.string().when('role', {
    is: 'student',
    then: () => Yup.string().required('Matricule number is required'),
  }),
  level: Yup.string().when('role', {
    is: 'student',
    then: () => Yup.string().required('Level is required'),
  })
})

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const theme = useTheme()

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let strength = 0
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[@$!%*?&#]/.test(password)
    ]
    strength = checks.filter(Boolean).length
    return {
      score: strength,
      label: strength < 2 ? 'Weak' : strength < 4 ? 'Fair' : strength < 5 ? 'Good' : 'Strong',
      color: strength < 2 ? 'error' : strength < 4 ? 'warning' : strength < 5 ? 'info' : 'success'
    }
  }

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      department: '',
      program: '',
      matricule: '',
      level: ''
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      setIsSubmitting(true)
      try {
        await register(values)
        navigate('/login')
      } catch (error) {
        console.error(error)
      } finally {
        setIsSubmitting(false)
      }
    }
  })

  const departments = [
    'Computer Science',
    'Engineering',
    'Business',
    'Arts',
    'Sciences'
  ]

  const levels = ['100', '200', '300', '400']
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
              p: 4,
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
                    width: 120,
                    height: 120,
                    mb: 2,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                  }}
                />
              </motion.div>
              
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Join Our Community
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  fontSize: '1.1rem'
                }}
              >
                Create your account to get started
              </Typography>
            </Box>            {/* Form */}
            <Box component="form" onSubmit={formik.handleSubmit}>
              {/* Name Field */}
              <TextField
                fullWidth
                name="name"
                label="Full Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                    }
                  }
                }}
              />

              {/* Email Field */}
              <TextField
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                    }                  }
                }}
              />

              {/* Password Field with Strength Indicator */}
              <TextField
                fullWidth
                name="password"
                label="Password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                    }
                  }
                }}
              />
              {formik.values.password && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Password Strength:
                    </Typography>
                    <Chip
                      label={calculatePasswordStrength(formik.values.password).label}
                      color={calculatePasswordStrength(formik.values.password).color}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(calculatePasswordStrength(formik.values.password).score / 5) * 100}
                    color={calculatePasswordStrength(formik.values.password).color}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              )}

              {/* Confirm Password Field */}
              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                    }
                  }
                }}
              />              {/* Role and Department Section */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.role && Boolean(formik.errors.role)}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 2,
                      }
                    }}
                  >
                    <MenuItem value="student">👨‍🎓 Student</MenuItem>
                    <MenuItem value="staff">👨‍💼 Staff</MenuItem>
                    <MenuItem value="admin">👨‍💻 Admin</MenuItem>
                  </Select>
                  {formik.touched.role && formik.errors.role && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {formik.errors.role}
                    </Typography>
                  )}
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department"
                    value={formik.values.department}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.department && Boolean(formik.errors.department)}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 2,
                      }
                    }}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                  {formik.touched.department && formik.errors.department && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {formik.errors.department}
                    </Typography>
                  )}
                </FormControl>
              </Box>              {/* Student-specific fields */}
              {formik.values.role === 'student' && (
                <Fade in={true}>
                  <Box>
                    <TextField
                      fullWidth
                      name="program"
                      label="Program"
                      value={formik.values.program}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.program && Boolean(formik.errors.program)}
                      helperText={formik.touched.program && formik.errors.program}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        }
                      }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <TextField
                        fullWidth
                        name="matricule"
                        label="Matricule Number"
                        value={formik.values.matricule}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.matricule && Boolean(formik.errors.matricule)}
                        helperText={formik.touched.matricule && formik.errors.matricule}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.primary.main, 0.02),
                          }
                        }}
                      />
                      
                      <FormControl fullWidth>
                        <InputLabel>Level</InputLabel>
                        <Select
                          name="level"
                          value={formik.values.level}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.level && Boolean(formik.errors.level)}
                          sx={{
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.primary.main, 0.02),
                          }}
                        >
                          {levels.map((level) => (
                            <MenuItem key={level} value={level}>Level {level}</MenuItem>
                          ))}
                        </Select>
                        {formik.touched.level && formik.errors.level && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                            {formik.errors.level}
                          </Typography>
                        )}
                      </FormControl>
                    </Box>
                  </Box>
                </Fade>              )}

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting || !formik.isValid}
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                  fontSize: '1.1rem',
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
                    <CircularProgress size={20} color="inherit" />
                    Creating Account...
                  </Box>
                ) : (
                  '🚀 Create Account'
                )}
              </Button>

              {/* Login Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    style={{ 
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                  >
                    Sign in here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  )
}