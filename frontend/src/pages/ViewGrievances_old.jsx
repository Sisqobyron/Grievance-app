import { useState, useEffect, useCallback } from 'react'
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
  IconButton,
  Grid,
  Divider
} from '@mui/material'
import { Message, Close, Refresh, Visibility, GetApp, Preview, Image as ImageIcon, PictureAsPdf } from '@mui/icons-material'
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
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [attachmentViewerOpen, setAttachmentViewerOpen] = useState(false)
  const [selectedGrievance, setSelectedGrievance] = useState(null)

  const fetchGrievances = useCallback(async () => {
    try {
      const url = user.role === 'student'
        ? `http://localhost:5000/api/grievances/student/${user.id}`
        : 'http://localhost:5000/api/grievances'
      
      const response = await axios.get(url)
      setGrievances(response.data)
    } catch (err) {
      console.error('Error fetching grievances:', err)
      toast.error('Failed to fetch grievances')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchGrievances()
  }, [fetchGrievances])

  const handleRefresh = () => {
    setLoading(true)
    fetchGrievances()
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
    } catch (err) {
      console.error('Error updating status:', err)
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }
  const openMessageDialog = (grievance) => {
    setSelectedGrievance(grievance)
    setMessageDialogOpen(true)
  }
  const openDetailDialog = (grievance) => {
    setSelectedGrievance(grievance)
    setDetailDialogOpen(true)
  }

  const openAttachmentViewer = (grievance) => {
    setSelectedGrievance(grievance)
    setAttachmentViewerOpen(true)
  }

  const getFileType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return 'image'
    } else if (extension === 'pdf') {
      return 'pdf'
    }
    return 'other'
  }

  const getFileIcon = (filename) => {
    const fileType = getFileType(filename)
    switch (fileType) {
      case 'image':
        return <ImageIcon />
      case 'pdf':
        return <PictureAsPdf />
      default:
        return <GetApp />
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            {user.role === 'student' ? 'My Grievances' : 'All Grievances'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
        
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
            </TableHead>            <TableBody>
              {grievances.map((grievance) => (
                <TableRow 
                  key={grievance.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => openDetailDialog(grievance)}
                >
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
                  </TableCell>                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailDialog(grievance);
                        }}
                        color="primary"
                        title="View Details"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openMessageDialog(grievance);
                        }}
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
      </Paper>      <Dialog
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

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Grievance Details - #{selectedGrievance?.id}
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setDetailDialogOpen(false)}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedGrievance && (
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Grievance ID
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  #{selectedGrievance.id}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={selectedGrievance.status}
                  color={getStatusColor(selectedGrievance.status)}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              {user.role === 'staff' && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Student Name
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedGrievance.student_name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Program
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedGrievance.program}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Level
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Level {selectedGrievance.level}
                    </Typography>
                  </Grid>
                </>
              )}
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Category
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedGrievance.category}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Subcategory
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedGrievance.subcategory || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Type
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedGrievance.type}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Priority Level
                </Typography>
                <Chip
                  label={selectedGrievance.priority_level}
                  color={selectedGrievance.priority_level === 'Urgent' ? 'error' : 'default'}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Submission Date
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(selectedGrievance.submission_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Grid>
              
              {/* Description */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Description
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                  {selectedGrievance.description}
                </Typography>
              </Grid>
              
              {/* Additional Details */}
              {(selectedGrievance.details || selectedGrievance.additional_info) && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Additional Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                    {selectedGrievance.details || selectedGrievance.additional_info}
                  </Typography>
                </Grid>
              )}
                {/* Attachments */}
              {selectedGrievance.attachment_path && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Attachments
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {(() => {
                      const filename = selectedGrievance.attachment_path.split('/').pop()
                      const fileType = getFileType(filename)
                      
                      return (
                        <>
                          {(fileType === 'image' || fileType === 'pdf') && (
                            <Button
                              variant="contained"
                              startIcon={<Preview />}
                              onClick={() => openAttachmentViewer(selectedGrievance)}
                              sx={{ mr: 1 }}
                            >
                              View {fileType === 'image' ? 'Image' : 'PDF'}
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            startIcon={getFileIcon(filename)}
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = `http://localhost:5000/uploads/${filename}`;
                              link.download = filename;
                              link.click();
                            }}
                          >
                            Download
                          </Button>
                          <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                            {filename}
                          </Typography>
                        </>
                      )
                    })()}
                  </Box>
                </Grid>
              )}
              
              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Message />}
                    onClick={() => {
                      setDetailDialogOpen(false);
                      openMessageDialog(selectedGrievance);
                    }}
                  >
                    View Messages
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setDetailDialogOpen(false)}
                  >
                    Close
                  </Button>
                </Box>
              </Grid>
            </Grid>          )}
        </DialogContent>
      </Dialog>

      {/* Attachment Viewer Dialog */}
      <Dialog
        open={attachmentViewerOpen}
        onClose={() => setAttachmentViewerOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          Attachment Viewer - {selectedGrievance?.attachment_path?.split('/').pop()}
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setAttachmentViewerOpen(false)}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {selectedGrievance?.attachment_path && (() => {
            const filename = selectedGrievance.attachment_path.split('/').pop()
            const fileType = getFileType(filename)
            const fileUrl = `http://localhost:5000/uploads/${filename}`
            
            if (fileType === 'image') {
              return (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    height: '100%',
                    p: 2
                  }}
                >
                  <img
                    src={fileUrl}
                    alt={filename}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: '4px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </Box>
              )
            } else if (fileType === 'pdf') {
              return (
                <Box sx={{ height: '100%' }}>
                  <iframe
                    src={fileUrl}
                    title={filename}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                  />
                </Box>
              )
            }
            
            return (
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '100%',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                <Typography variant="h6">
                  Preview not available for this file type
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<GetApp />}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = fileUrl;
                    link.download = filename;
                    link.click();
                  }}
                >
                  Download File
                </Button>
              </Box>
            )
          })()}
        </DialogContent>
      </Dialog>
    </Container>
  )
}