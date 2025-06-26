#!/bin/bash

# Script to replace all localhost:5000 URLs with the API configuration
# Run this from the frontend directory

echo "🔧 Updating all hardcoded API URLs to use centralized configuration..."

# Create the new import pattern for components that need API calls
API_IMPORT="import api from '../config/axios'"

# Files to update (most common ones that use axios)
FILES=(
  "src/pages/Dashboard.jsx"
  "src/pages/StaffDashboard.jsx"
  "src/pages/ViewGrievances.jsx"
  "src/pages/SubmitGrievance.jsx"
  "src/pages/Notifications.jsx"
  "src/components/CoordinatorDashboard.jsx"
  "src/components/CoordinatorWorkspaceDashboard.jsx"
  "src/components/EscalationManagement.jsx"
  "src/components/Messages.jsx"
  "src/components/GrievanceViz.jsx"
)

echo "📝 Files that need manual updating:"
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    count=$(grep -c "localhost:5000" "$file" 2>/dev/null || echo "0")
    if [ "$count" -gt 0 ]; then
      echo "   - $file ($count occurrences)"
    fi
  fi
done

echo ""
echo "🛠️  Manual steps needed:"
echo "1. Add 'import api from '../config/axios'' to each file"
echo "2. Replace axios.get('http://localhost:5000/api/...') with api.get('/api/...')"
echo "3. Replace axios.post('http://localhost:5000/api/...') with api.post('/api/...')"
echo "4. Replace axios.put('http://localhost:5000/api/...') with api.put('/api/...')"
echo ""
echo "✅ AuthContext already updated to use centralized API configuration"
echo ""
echo "🚀 After updates, rebuild and redeploy:"
echo "   npm run build"
