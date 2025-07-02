import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useFormik } from 'formik'
import api from '../config/axios'
import { toast } from 'react-toastify'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  MenuItem
} from '@mui/material'
import SmartCategorySelector from '../components/SmartCategorySelector'
import DynamicFormFields from '../components/DynamicFormFields'
import { getSuggestedPriority, fieldConfigurations } from '../utils/categoryData'

// Simplified - no validation schema for now

export default function SubmitGrievance() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [dynamicFieldValues, setDynamicFieldValues] = useState({})
  const [dynamicFieldErrors, setDynamicFieldErrors] = useState({})
  const [dynamicFieldTouched, setDynamicFieldTouched] = useState({})

  // const requiredFields = getRequiredFields(selectedCategory, selectedSubcategory) // DISABLED FOR TESTING
  const suggestedPriority = getSuggestedPriority(selectedCategory, selectedSubcategory)

  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    if (priority === 'High' || priority === 'Urgent') return 'error'
    if (priority === 'Medium') return 'warning'
    return 'success'
  }
  // Update validation schema when category/subcategory changes - DISABLED FOR TESTING
  // const validationSchema = React.useMemo(() => {
  //   return createValidationSchema(selectedCategory, selectedSubcategory, requiredFields)
  // }, [selectedCategory, selectedSubcategory, requiredFields])
  const formik = useFormik({
    initialValues: {
      type: selectedCategory,
      subcategory: selectedSubcategory,
      description: '',
      priority_level: suggestedPriority
    },
    // validationSchema removed for testing
    enableReinitialize: true,    onSubmit: async (values) => {
      console.log('🚀 FORM SUBMISSION TRIGGERED! NO VALIDATION VERSION', { 
        values, 
        selectedCategory, 
        selectedSubcategory, 
        dynamicFieldValues, 
        user 
      })
      setIsSubmitting(true)
      
      try {
        // Check if user is authenticated
        if (!user?.id) {
          console.log('❌ User not authenticated')
          toast.error('You must be logged in to submit a grievance')
          navigate('/login')
          return
        }
        console.log('✅ User authenticated:', user.id)

        // Use hardcoded values if fields are empty (for testing)
        const category = selectedCategory || 'Academic'
        const subcategory = selectedSubcategory || 'Grading'
        const description = values.description || 'Test submission with no validation - frontend to backend test'
        const priority = values.priority_level || 'Medium'

        console.log('📝 Preparing form data (SIMPLIFIED):', {
          student_id: user.id,
          type: category,
          subcategory: subcategory,
          description: description,
          priority_level: priority
        })

        const formData = new FormData()
        formData.append('student_id', user.id)
        formData.append('type', category)
        formData.append('subcategory', subcategory)
        formData.append('description', description)
        formData.append('priority_level', priority)
        
        // Add dynamic field values
        Object.entries(dynamicFieldValues).forEach(([key, value]) => {
          if (value) formData.append(key, value)
        })

        if (file) {
          formData.append('attachment', file)
          console.log('📎 File attached:', file.name)
        }        console.log('🚀 Making API call to submit grievance...')
        const response = await api.post('/api/grievances/submit', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        console.log('✅ Submission successful!', response.data)
        toast.success(`Grievance submitted successfully! ID: ${response.data.grievanceId}`)
        
        // Navigate to grievances page after successful submission
        setTimeout(() => {
          navigate('/grievances')
        }, 2000)
        
      } catch (error) {
        console.error('❌ Submission error:', error)
        console.error('❌ Error details:', error.response?.data)
        toast.error(error.response?.data?.message || 'Failed to submit grievance')
      } finally {
        setIsSubmitting(false)
      }
    }
  })
  // Update formik values when category/subcategory changes
  useEffect(() => {
    formik.setFieldValue('type', selectedCategory)
    formik.setFieldValue('subcategory', selectedSubcategory)
    formik.setFieldValue('priority_level', suggestedPriority)
    setDynamicFieldValues({}) // Reset dynamic fields
    setDynamicFieldErrors({})
    setDynamicFieldTouched({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedSubcategory, suggestedPriority])

    const priorityLevels = [
    'Low',
    'Medium',
    'High',
    'Urgent'
  ]

  const steps = [
    'Category Selection',
    'Details & Description',
    'Review & Submit'
  ]
  
  const handleNext = () => {
    console.log('🔄 Moving to next step:', activeStep, '->', activeStep + 1)
    // VALIDATION TEMPORARILY DISABLED FOR TESTING
    // if (activeStep === 0 && (!selectedCategory || !selectedSubcategory)) {
    //   toast.error('Please select a category and subcategory')
    //   return
    // }
    // if (activeStep === 1 && !formik.values.description) {
    //   toast.error('Please provide a description')
    //   return
    // }
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleDynamicFieldChange = (fieldName, value) => {
    setDynamicFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }))
    setDynamicFieldTouched(prev => ({
      ...prev,
      [fieldName]: true
    }))
    // Clear error when user starts typing
    if (dynamicFieldErrors[fieldName]) {
      setDynamicFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      setFile(file)
    } else {
      toast.error('Please upload only PDF or image files')
      event.target.value = null
    }
  }  // Helper function to check if form is ready for submission - DISABLED FOR TESTING
  // const isFormReadyForSubmission = () => {
  //   const hasBasicInfo = !!(selectedCategory && selectedSubcategory && formik.values.description)
  //   const hasRequiredDynamicFields = requiredFields.every(fieldName => {
  //     const config = fieldConfigurations[fieldName]
  //     return !config?.required || dynamicFieldValues[fieldName]
  //   })
  //   
  //   console.log('Form readiness check:', {
  //     hasBasicInfo,
  //     hasRequiredDynamicFields,
  //     selectedCategory,
  //     selectedSubcategory,
  //     description: formik.values.description,
  //     requiredFields,
  //     dynamicFieldValues
  //   })
  //   
  //   return hasBasicInfo && hasRequiredDynamicFields
  // }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <SmartCategorySelector
            description={formik.values.description}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategoryChange={setSelectedCategory}
            onSubcategoryChange={setSelectedSubcategory}
          />
        )
      case 1:
        return (
          <Box>
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
              placeholder="Please provide a detailed description of your grievance. Be specific and include relevant dates, names, and circumstances."
            />

            <DynamicFormFields
              category={selectedCategory}
              subcategory={selectedSubcategory}
              values={dynamicFieldValues}
              onChange={handleDynamicFieldChange}
              errors={dynamicFieldErrors}
              touched={dynamicFieldTouched}
            />

            <TextField
              fullWidth
              margin="normal"
              name="priority_level"
              label="Priority Level"
              select
              value={formik.values.priority_level}
              onChange={formik.handleChange}
              error={formik.touched.priority_level && Boolean(formik.errors.priority_level)}
              helperText={formik.touched.priority_level && formik.errors.priority_level || "Priority is automatically set based on your category selection"}
              disabled={true}
              InputProps={{
                readOnly: true,
              }}
            >
              {priorityLevels.map((level) => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
              ))}
            </TextField>            <Box sx={{ mt: 2 }}>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="contained" component="span">
                  Upload Attachment (PDF or Image)
                </Button>
              </label>
            </Box>
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                File selected: {file.name}
              </Typography>
            )}
          </Box>
        )
      case 2:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please review your grievance details before submitting.
            </Alert>
            
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Grievance Summary</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography><strong>Category:</strong> {selectedCategory}</Typography>
                <Typography><strong>Subcategory:</strong> {selectedSubcategory}</Typography>
                <Typography><strong>Priority:</strong>                  <Chip 
                    label={formik.values.priority_level} 
                    size="small" 
                    color={getPriorityColor(formik.values.priority_level)}
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>Description:</Typography>
              <Typography variant="body2" sx={{ mb: 2, p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
                {formik.values.description}
              </Typography>

              {Object.keys(dynamicFieldValues).length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>Additional Details:</Typography>
                  {Object.entries(dynamicFieldValues).map(([key, value]) => {
                    const config = fieldConfigurations[key]
                    return (
                      <Typography key={key} variant="body2">
                        <strong>{config?.label}:</strong> {value}
                      </Typography>
                    )
                  })}
                </>
              )}

              {file && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Attachment:</strong> {file.name}
                </Typography>
              )}
            </Paper>
          </Box>
        )
      default:
        return 'Unknown step'
    }
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Submit a Grievance
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>        <div>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  console.log('🔘 Submit button clicked manually! NO AUTO-SUBMIT', {
                    isSubmitting,
                    disabled: isSubmitting
                  });
                  // Manually trigger formik submission
                  formik.submitForm();
                }}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Submit Grievance (MANUAL ONLY)'}
              </Button>
            ) : (
              <Button onClick={handleNext} variant="contained">
                Next
              </Button>
            )}
          </Box>
        </div>
      </Paper>
    </Container>
  )
}