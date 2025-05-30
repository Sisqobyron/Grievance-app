import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  AlertTitle,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AutoAwesome as AIIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { hierarchicalCategories, suggestCategories, getRequiredFields } from '../utils/categoryData';

const SmartCategorySelector = ({ 
  description, 
  selectedCategory, 
  selectedSubcategory, 
  onCategoryChange, 
  onSubcategoryChange 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    if (description && description.length > 10) {
      const newSuggestions = suggestCategories(description);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [description]);

  const handleSuggestionClick = (suggestion) => {
    onCategoryChange(suggestion.category);
    onSubcategoryChange(suggestion.subcategory);
  };

  const handleCategorySelect = (category) => {
    onCategoryChange(category);
    onSubcategoryChange(''); // Reset subcategory when category changes
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <Alert 
          severity="info" 
          icon={<AIIcon />}
          sx={{ mb: 2 }}
        >
          <AlertTitle>Smart Category Suggestions</AlertTitle>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Based on your description, we suggest these categories:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                label={`${suggestion.category} → ${suggestion.subcategory}`}
                variant="outlined"
                color="primary"
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                }}
                icon={<Typography variant="caption">{Math.round(suggestion.confidence)}%</Typography>}
              />
            ))}
          </Box>
        </Alert>
      )}

      {/* Manual Category Selection */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Select Category</Typography>
            <Tooltip title="Choose a category that best describes your grievance">
              <IconButton size="small">
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Category Grid */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {Object.entries(hierarchicalCategories).map(([category, data]) => (
              <Grid item xs={12} sm={6} md={4} key={category}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedCategory === category ? 2 : 1,
                    borderColor: selectedCategory === category ? 'primary.main' : 'grey.300',
                    backgroundColor: selectedCategory === category ? 'primary.50' : 'background.paper',
                    '&:hover': {
                      backgroundColor: 'primary.50',
                      borderColor: 'primary.main'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={() => handleCategorySelect(category)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h4" sx={{ mr: 1 }}>
                        {data.icon}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {data.label}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {data.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Subcategory Selection */}
          {selectedCategory && (
            <Accordion expanded={true}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  Select Subcategory for {hierarchicalCategories[selectedCategory].label}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {Object.entries(hierarchicalCategories[selectedCategory].subcategories).map(
                    ([subcategory, subData]) => (
                      <Grid item xs={12} sm={6} key={subcategory}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            border: selectedSubcategory === subcategory ? 2 : 1,
                            borderColor: selectedSubcategory === subcategory ? 'secondary.main' : 'grey.300',
                            backgroundColor: selectedSubcategory === subcategory ? 'secondary.50' : 'background.paper',
                            '&:hover': {
                              backgroundColor: 'secondary.50',
                              borderColor: 'secondary.main'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                          onClick={() => onSubcategoryChange(subcategory)}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {subcategory}
                              </Typography>
                              <Chip 
                                label={subData.priority} 
                                size="small" 
                                color={
                                  subData.priority === 'High' ? 'error' : 
                                  subData.priority === 'Medium' ? 'warning' : 'success'
                                }
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Required fields: {subData.requiredFields.length}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SmartCategorySelector;
