import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress
} from '@mui/material'

const validationSchema = Yup.object({
  type: Yup.string().required('Type of grievance is required'),
  description: Yup.string()
    .required('Description is required')
    .min(20, 'Description should be at least 20 characters'),
  priority_level: Yup.string().required('Priority level is required')
})

export default function SubmitGrievance() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formik = useFormik({
    initialValues: {
      type: '',
      description: '',
      priority_level: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true)
      try {
        const formData = new FormData()
        formData.append('student_id', user.id)
        formData.append('type', values.type)
        formData.append('description', values.description)
        formData.append('priority_level', values.priority_level)
        if (file) {
          formData.append('attachment', file)
        }

        await axios.post('http://localhost:5000/api/grievances/submit', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        toast.success('Grievance submitted successfully')
        navigate('/grievances')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to submit grievance')
      } finally {
        setIsSubmitting(false)
      }
    }
  })

  const grievanceTypes = [
    'Academic',
    'Administrative',
    'Financial',
    'Infrastructure',
    'Other'
  ]

  const priorityLevels = [
    'Low',
    'Medium',
    'High',
    'Urgent'
  ]

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      setFile(file)
    } else {
      toast.error('Please upload only PDF or image files')
      event.target.value = null
    }
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Submit a Grievance
        </Typography>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Type of Grievance</InputLabel>
            <Select
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
              error={formik.touched.type && Boolean(formik.errors.type)}
            >
              {grievanceTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            name="description"
            label="Description"
            multiline
            rows={4}
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Priority Level</InputLabel>
            <Select
              name="priority_level"
              value={formik.values.priority_level}
              onChange={formik.handleChange}
              error={formik.touched.priority_level && Boolean(formik.errors.priority_level)}
            >
              {priorityLevels.map((level) => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            component="label"
            sx={{ mt: 2 }}
          >
            Upload Attachment (PDF or Image)
            <input
              type="file"
              hidden
              accept=".pdf,image/*"
              onChange={handleFileChange}
            />
          </Button>
          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              File selected: {file.name}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Submit Grievance'}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}