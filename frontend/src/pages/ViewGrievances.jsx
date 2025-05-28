import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  Select,
  MenuItem,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material'
import { Message, Close } from '@mui/icons-material'
import Messages from '../components/Messages'

const getStatusColor = (status) => {
  switch (status) {
    case 'Submitted':
      return 'info'
    case 'In Progress':
      return 'warning'
    case 'Resolved':
      return 'success'
    case 'Rejected':
      return 'error'
    default:
      return 'default'
  }
}

export default function ViewGrievances() {
  const { user } = useAuth()
  const [grievances, setGrievances] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [selectedGrievance, setSelectedGrievance] = useState(null)

  useEffect(() => {
    fetchGrievances()
  }, [user])

  const fetchGrievances = async () => {
    try {
      const url = user.role === 'student'
        ? `http://localhost:5000/api/grievances/student/${user.id}`
        : 'http://localhost:5000/api/grievances'
      
      const response = await axios.get(url)
      setGrievances(response.data)
    } catch (error) {
      toast.error('Failed to fetch grievances')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (grievanceId, newStatus) => {
    setUpdatingId(grievanceId)
    try {
      await axios.put(`http://localhost:5000/api/grievances/${grievanceId}/status`, {
        status: newStatus
      })
      
      setGrievances(grievances.map(g => 
        g.id === grievanceId ? { ...g, status: newStatus } : g
      ))
      
      toast.success('Status updated successfully')
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const openMessageDialog = (grievance) => {
    setSelectedGrievance(grievance)
    setMessageDialogOpen(true)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          {user.role === 'student' ? 'My Grievances' : 'All Grievances'}
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                {user.role === 'staff' && (
                  <>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Program</TableCell>
                  </>
                )}
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted On</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grievances.map((grievance) => (
                <TableRow key={grievance.id}>
                  <TableCell>{grievance.id}</TableCell>
                  {user.role === 'staff' && (
                    <>
                      <TableCell>
                        <Typography variant="body2">
                          {grievance.student_name}
                          <Typography variant="caption" display="block" color="textSecondary">
                            Level {grievance.level}
                          </Typography>
                        </Typography>
                      </TableCell>
                      <TableCell>{grievance.program}</TableCell>
                    </>
                  )}
                  <TableCell>{grievance.type}</TableCell>
                  <TableCell>{grievance.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={grievance.priority_level}
                      color={grievance.priority_level === 'Urgent' ? 'error' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={grievance.status}
                      color={getStatusColor(grievance.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(grievance.submission_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => openMessageDialog(grievance)}
                        color="primary"
                        title="Messages"
                      >
                        <Message />
                      </IconButton>
                      {user.role === 'staff' && (
                        <FormControl size="small">
                          <Select
                            value=""
                            displayEmpty
                            disabled={updatingId === grievance.id}
                            onChange={(e) => handleStatusUpdate(grievance.id, e.target.value)}
                          >
                            <MenuItem value="" disabled>
                              Update Status
                            </MenuItem>
                            <MenuItem value="In Progress">Mark In Progress</MenuItem>
                            <MenuItem value="Resolved">Mark Resolved</MenuItem>
                            <MenuItem value="Rejected">Reject</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {grievances.length === 0 && (
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            No grievances found.
          </Typography>
        )}
      </Paper>

      <Dialog
        open={messageDialogOpen}
        onClose={() => setMessageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Messages for Grievance #{selectedGrievance?.id}
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setMessageDialogOpen(false)}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedGrievance && (
            <Messages
              grievanceId={selectedGrievance.id}
              studentId={user.role === 'staff' ? selectedGrievance.student_id : user.id}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  )
}