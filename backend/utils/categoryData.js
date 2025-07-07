// Category data structure with hierarchical categories and keywords
const hierarchicalCategories = {
  Academic: {
    label: 'Academic Issues',
    icon: '📚',
    description: 'Issues related to academic processes and educational matters',
    subcategories: {
      'Grading Issues': {
        keywords: ['grade', 'mark', 'score', 'assessment', 'exam', 'test', 'quiz', 'assignment', 'unfair', 'incorrect', 'wrong grade'],
        requiredFields: ['course_code', 'instructor_name', 'semester'],
        priority: 'Medium'
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
      'Financial Records': {
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
        priority: 'Medium'
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

module.exports = {
  hierarchicalCategories
};
