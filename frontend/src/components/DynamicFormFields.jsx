import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import { getRequiredFields, fieldConfigurations } from '../utils/categoryData';

const DynamicFormFields = ({ 
  category, 
  subcategory, 
  values, 
  onChange, 
  errors, 
  touched 
}) => {
  const requiredFields = getRequiredFields(category, subcategory);

  if (!category || !subcategory || requiredFields.length === 0) {
    return null;
  }

  const handleFieldChange = (fieldName, value) => {
    onChange(fieldName, value);
  };

  const renderField = (fieldName) => {
    const config = fieldConfigurations[fieldName];
    if (!config) return null;

    const fieldValue = values[fieldName] || '';
    const hasError = touched[fieldName] && errors[fieldName];

    switch (config.type) {
      case 'text':
      case 'number':
        return (
          <TextField
            key={fieldName}
            fullWidth
            name={fieldName}
            label={config.label}
            type={config.type}
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            placeholder={config.placeholder}
            required={config.required}
            error={Boolean(hasError)}
            helperText={hasError || ''}
            margin="normal"
          />
        );

      case 'date':
        return (
          <TextField
            key={fieldName}
            fullWidth
            name={fieldName}
            label={config.label}
            type="date"
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            required={config.required}
            error={Boolean(hasError)}
            helperText={hasError || ''}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
        );

      case 'select':
        return (
          <FormControl 
            key={fieldName}
            fullWidth 
            margin="normal" 
            error={Boolean(hasError)}
            required={config.required}
          >
            <InputLabel>{config.label}</InputLabel>
            <Select
              name={fieldName}
              value={fieldValue}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              label={config.label}
            >
              {config.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {hasError && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors[fieldName]}
              </Typography>
            )}
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 2, backgroundColor: 'grey.50' }}>
      <Typography variant="h6" gutterBottom>
        Additional Information Required
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Please provide the following details for your {subcategory.toLowerCase()} grievance:
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box>
        {requiredFields.map((fieldName) => renderField(fieldName))}
      </Box>
    </Paper>
  );
};

export default DynamicFormFields;
