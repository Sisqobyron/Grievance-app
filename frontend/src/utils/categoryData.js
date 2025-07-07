// Category data structure with hierarchical categories and keywords
export const hierarchicalCategories = {
  Academic: {
    label: 'Academic Issues',
    icon: '📚',
    description: 'Issues related to academic processes and educational matters',
    subcategories: {
      'Grading Issues': {
        keywords: ['grade', 'mark', 'score', 'assessment', 'exam', 'test', 'quiz', 'assignment', 'unfair', 'incorrect', 'wrong grade'],
        requiredFields: ['course_code', 'instructor_name', 'semester'],
        priority: 'High'
      },
      'Course Content': {
        keywords: ['curriculum', 'syllabus', 'course material', 'textbook', 'outdated', 'irrelevant', 'missing content'],
        requiredFields: ['course_code', 'semester'],
        priority: 'Low'
      },
      'Teaching Quality': {
        keywords: ['instructor', 'teacher', 'professor', 'teaching method', 'explanation', 'unclear', 'poor teaching'],
        requiredFields: ['course_code', 'instructor_name', 'semester'],
        priority: 'Medium'
      },
      'Examination Issues': {
        keywords: ['exam', 'test', 'evaluation', 'cheating', 'misconduct', 'unfair exam', 'time allocation'],
        requiredFields: ['course_code', 'exam_date', 'semester'],
        priority: 'High'
      },
      'Assignment Problems': {
        keywords: ['assignment', 'project', 'homework', 'deadline', 'late submission', 'unclear instructions'],
        requiredFields: ['course_code', 'assignment_title', 'semester'],
        priority: 'Medium'
      }
    }
  },
  Administrative: {
    label: 'Administrative Issues',
    icon: '🏢',
    description: 'Issues related to administrative processes and services',
    subcategories: {
      'Registration Issues': {
        keywords: ['registration', 'enrollment', 'course selection', 'add/drop', 'waitlist', 'class schedule'],
        requiredFields: ['semester', 'affected_courses'],
        priority: 'High'
      },
      'Document Processing': {
        keywords: ['transcript', 'certificate', 'diploma', 'verification', 'delay', 'processing time', 'document'],
        requiredFields: ['document_type', 'request_date'],
        priority: 'Medium'
      },
      'Student Records': {
        keywords: ['personal information', 'contact details', 'address change', 'name change', 'student ID'],
        requiredFields: ['record_type'],
        priority: 'Medium'
      },
      'Admission Issues': {
        keywords: ['admission', 'application', 'acceptance', 'rejection', 'transfer', 'requirements'],
        requiredFields: ['program_applied', 'application_date'],
        priority: 'High'
      },
      'Staff Behavior': {
        keywords: ['staff', 'employee', 'rude', 'unprofessional', 'discrimination', 'harassment', 'misconduct'],
        requiredFields: ['staff_name', 'department', 'incident_date'],
        priority: 'High'
      }
    }
  },
  Financial: {
    label: 'Financial Issues',
    icon: '💰',
    description: 'Issues related to fees, payments, and financial matters',
    subcategories: {
      'Fee Payment': {
        keywords: ['tuition', 'fees', 'payment', 'billing', 'invoice', 'overcharge', 'incorrect amount'],
        requiredFields: ['amount', 'payment_date', 'semester'],
        priority: 'High'
      },
      'Scholarship Issues': {
        keywords: ['scholarship', 'financial aid', 'grant', 'bursary', 'funding', 'award', 'eligibility'],
        requiredFields: ['scholarship_name', 'award_year'],
        priority: 'Medium'
      },
      'Refund Requests': {
        keywords: ['refund', 'reimbursement', 'overpayment', 'withdrawal', 'cancellation'],
        requiredFields: ['amount', 'reason_for_refund', 'semester'],
        priority: 'Medium'
      },
      'Financial Clearance': {
        keywords: ['financial statement', 'payment history', 'balance', 'account', 'financial record'],
        requiredFields: ['semester', 'record_type'],
        priority: 'Low'
      }
    }
  },
  Infrastructure: {
    label: 'Infrastructure & Facilities',
    icon: '🏗️',
    description: 'Issues related to campus facilities and infrastructure',
    subcategories: {
      'Classroom Facilities': {
        keywords: ['classroom', 'projector', 'air conditioning', 'lighting', 'furniture', 'equipment', 'broken'],
        requiredFields: ['location', 'facility_type'],
        priority: 'High'
      },
      'Library Issues': {
        keywords: ['library', 'books', 'computer', 'internet', 'study space', 'noise', 'resources'],
        requiredFields: ['library_location', 'issue_type'],
        priority: 'Low'
      },
      'Laboratory Problems': {
        keywords: ['laboratory', 'lab', 'equipment', 'safety', 'chemicals', 'instruments', 'maintenance'],
        requiredFields: ['lab_name', 'equipment_type'],
        priority: 'High'
      },
      'IT Services': {
        keywords: ['computer', 'internet', 'wifi', 'network', 'system', 'software', 'technical'],
        requiredFields: ['system_type', 'error_description'],
        priority: 'Medium'
      },
      'Campus Safety': {
        keywords: ['safety', 'security', 'emergency', 'accident', 'hazard', 'lighting', 'access'],
        requiredFields: ['location', 'safety_concern'],
        priority: 'High'
      }
    }
  },
  Other: {
    label: 'Other Issues',
    icon: '📋',
    description: 'Other issues not covered by the above categories',
    subcategories: {
      'General Complaint': {
        keywords: ['general', 'other', 'miscellaneous', 'complaint', 'concern', 'issue'],
        requiredFields: ['issue_category'],
        priority: 'Low'
      },
      'Suggestion': {
        keywords: ['suggestion', 'improvement', 'recommendation', 'feedback', 'enhancement'],
        requiredFields: ['suggestion_category'],
        priority: 'Low'
      },
      'Discrimination': {
        keywords: ['discrimination', 'bias', 'unfair treatment', 'prejudice', 'harassment', 'bullying'],
        requiredFields: ['incident_date', 'parties_involved'],
        priority: 'High'
      }
    }
  }
};

// Keywords for smart category suggestion
export const categoryKeywords = Object.entries(hierarchicalCategories).reduce((acc, [category, data]) => {
  acc[category] = [];
  Object.entries(data.subcategories).forEach(([subcategory, subData]) => {
    acc[category].push(...subData.keywords);
  });
  return acc;
}, {});

// Function to suggest categories based on description
export const suggestCategories = (description) => {
  const words = description.toLowerCase().split(/\s+/);
  const suggestions = [];

  Object.entries(hierarchicalCategories).forEach(([category, data]) => {
    let score = 0;
    let bestSubcategory = null;
    let bestSubcategoryScore = 0;

    Object.entries(data.subcategories).forEach(([subcategory, subData]) => {
      let subcategoryScore = 0;
      subData.keywords.forEach(keyword => {
        if (description.toLowerCase().includes(keyword.toLowerCase())) {
          subcategoryScore += keyword.split(' ').length; // Multi-word keywords get higher score
        }
      });
      
      if (subcategoryScore > bestSubcategoryScore) {
        bestSubcategoryScore = subcategoryScore;
        bestSubcategory = subcategory;
      }
      score += subcategoryScore;
    });

    if (score > 0) {
      suggestions.push({
        category,
        subcategory: bestSubcategory,
        score,
        confidence: Math.min(score * 10, 100) // Convert to percentage
      });
    }
  });

  // Sort by score and return top 3
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .filter(s => s.confidence >= 20); // Only return suggestions with at least 20% confidence
};

// Function to get required fields for a subcategory
export const getRequiredFields = (category, subcategory) => {
  return hierarchicalCategories[category]?.subcategories[subcategory]?.requiredFields || [];
};

// Function to get suggested priority
export const getSuggestedPriority = (category, subcategory) => {
  return hierarchicalCategories[category]?.subcategories[subcategory]?.priority || 'Medium';
};

// Field configurations for dynamic form fields
export const fieldConfigurations = {
  course_code: {
    label: 'Course Code',
    type: 'text',
    placeholder: 'e.g., CS101, MATH201',
    required: true
  },
  instructor_name: {
    label: 'Instructor Name',
    type: 'text',
    placeholder: 'Enter instructor\'s full name',
    required: true
  },
  semester: {
    label: 'Semester',
    type: 'select',
    options: ['Fall 2025', 'Spring 2025', 'Summer 2024', 'Fall 2024', 'Spring 2024', 'Fall 2023', 'Spring 2023', 'Summer 2023'],
    required: true
  },
  exam_date: {
    label: 'Exam Date',
    type: 'date',
    required: true
  },
  assignment_title: {
    label: 'Assignment Title',
    type: 'text',
    placeholder: 'Enter assignment title',
    required: true
  },
  affected_courses: {
    label: 'Affected Courses',
    type: 'text',
    placeholder: 'List affected courses (comma-separated)',
    required: true
  },
  document_type: {
    label: 'Document Type',
    type: 'select',
    options: ['Transcript', 'Certificate', 'Diploma', 'Letter of Recommendation', 'Verification Letter'],
    required: true
  },
  request_date: {
    label: 'Request Date',
    type: 'date',
    required: true
  },
  record_type: {
    label: 'Record Type',
    type: 'select',
    options: ['Personal Information', 'Contact Details', 'Academic Records', 'Emergency Contacts'],
    required: true
  },
  program_applied: {
    label: 'Program Applied',
    type: 'text',
    placeholder: 'Enter program name',
    required: true
  },
  application_date: {
    label: 'Application Date',
    type: 'date',
    required: true
  },
  staff_name: {
    label: 'Staff Name',
    type: 'text',
    placeholder: 'Enter staff member\'s name',
    required: true
  },
  department: {
    label: 'Department',
    type: 'select',
    options: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering', 'Business', 'Literature'],
    required: true
  },
  incident_date: {
    label: 'Incident Date',
    type: 'date',
    required: true
  },
  amount: {
    label: 'Amount',
    type: 'number',
    placeholder: 'Enter amount',
    required: true
  },
  payment_date: {
    label: 'Payment Date',
    type: 'date',
    required: true
  },
  scholarship_name: {
    label: 'Scholarship Name',
    type: 'text',
    placeholder: 'Enter scholarship name',
    required: true
  },
  award_year: {
    label: 'Award Year',
    type: 'select',
    options: ['2024', '2023', '2022', '2021', '2020'],
    required: true
  },
  reason_for_refund: {
    label: 'Reason for Refund',
    type: 'text',
    placeholder: 'Explain reason for refund request',
    required: true
  },
  location: {
    label: 'Location',
    type: 'text',
    placeholder: 'Building and room number',
    required: true
  },
  facility_type: {
    label: 'Facility Type',
    type: 'select',
    options: ['Projector', 'Air Conditioning', 'Lighting', 'Furniture', 'Audio System', 'Whiteboard'],
    required: true
  },
  library_location: {
    label: 'Library Location',
    type: 'select',
    options: ['Main Library', 'Science Library', 'Law Library', 'Medical Library'],
    required: true
  },
  issue_type: {
    label: 'Issue Type',
    type: 'select',
    options: ['Books/Resources', 'Computer/Internet', 'Study Space', 'Noise', 'Staff Assistance'],
    required: true
  },
  lab_name: {
    label: 'Laboratory Name',
    type: 'text',
    placeholder: 'Enter laboratory name',
    required: true
  },
  equipment_type: {
    label: 'Equipment Type',
    type: 'text',
    placeholder: 'Specify equipment',
    required: true
  },
  system_type: {
    label: 'System Type',
    type: 'select',
    options: ['Computer Lab', 'WiFi Network', 'Learning Management System', 'Email System', 'Registration System'],
    required: true
  },
  error_description: {
    label: 'Error Description',
    type: 'text',
    placeholder: 'Describe the technical error',
    required: true
  },
  safety_concern: {
    label: 'Safety Concern',
    type: 'text',
    placeholder: 'Describe the safety concern',
    required: true
  },
  issue_category: {
    label: 'Issue Category',
    type: 'text',
    placeholder: 'Briefly categorize your issue',
    required: true
  },
  suggestion_category: {
    label: 'Suggestion Category',
    type: 'select',
    options: ['Academic Process', 'Campus Facilities', 'Student Services', 'Technology', 'Other'],
    required: true
  },
  parties_involved: {
    label: 'Parties Involved',
    type: 'text',
    placeholder: 'Names/roles of people involved',
    required: true
  }
};
