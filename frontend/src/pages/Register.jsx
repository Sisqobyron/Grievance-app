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
  MenuItem
} from '@mui/material'

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
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

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      role: '',
      department: '',
      program: '',
      matricule: '',
      level: ''
    },
    validationSchema,
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
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Register for Student Grievance System
          </Typography>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              margin="normal"
              name="name"
              label="Full Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              margin="normal"
              name="email"
              label="Email Address"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              fullWidth
              margin="normal"
              name="password"
              label="Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
                error={formik.touched.role && Boolean(formik.errors.role)}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Department</InputLabel>
              <Select
                name="department"
                value={formik.values.department}
                onChange={formik.handleChange}
                error={formik.touched.department && Boolean(formik.errors.department)}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {formik.values.role === 'student' && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  name="program"
                  label="Program"
                  value={formik.values.program}
                  onChange={formik.handleChange}
                  error={formik.touched.program && Boolean(formik.errors.program)}
                  helperText={formik.touched.program && formik.errors.program}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  name="matricule"
                  label="Matricule Number"
                  value={formik.values.matricule}
                  onChange={formik.handleChange}
                  error={formik.touched.matricule && Boolean(formik.errors.matricule)}
                  helperText={formik.touched.matricule && formik.errors.matricule}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Level</InputLabel>
                  <Select
                    name="level"
                    value={formik.values.level}
                    onChange={formik.handleChange}
                    error={formik.touched.level && Boolean(formik.errors.level)}
                  >
                    {levels.map((level) => (
                      <MenuItem key={level} value={level}>Level {level}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Register'}
            </Button>
            <Typography variant="body2" align="center">
              Already have an account?{' '}
              <Link to="/login">Login here</Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}