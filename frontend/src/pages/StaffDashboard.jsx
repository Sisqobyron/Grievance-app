import { useState, useEffect } from 'react'
import api from '../config/axios'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import {
  Container,
  Grid,
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  IconButton,
  Skeleton,
  useTheme
} from '@mui/material'
import { 
  Download, 
  Visibility, 
  Close, 
  List as ListIcon, 
  Assessment, 
  CheckCircle, 
  Warning
} from '@mui/icons-material'

const containerAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1
    }
  }
}

const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

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

const StatCard = ({ title, value, color, icon, isLoading }) => (
  <motion.div variants={itemAnimation}>
    <Card className="glass-effect hover-card">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            {isLoading ? (
              <>
                <Skeleton width={100} height={24} />
                <Skeleton width={60} height={40} />
              </>
            ) : (
              <>
                <Typography color="textSecondary" gutterBottom>
                  {title}
                </Typography>
                <Typography variant="h3" sx={{ color }}>
                  {value}
                </Typography>
              </>
            )}
          </Box>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: '12px', 
            bgcolor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
)

export default function StaffDashboard() {
  const theme = useTheme()
  const [grievances, setGrievances] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    urgent: 0
  })
  const [selectedGrievance, setSelectedGrievance] = useState(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    fetchGrievances()
  }, [])
  const fetchGrievances = async () => {
    try {
      const response = await api.get('/api/grievances')
      setGrievances(response.data)
      
      // Calculate stats
      const total = response.data.length
      const resolved = response.data.filter(g => g.status === 'Resolved').length
      const urgent = response.data.filter(g => g.priority_level === 'Urgent').length
        setStats({
        total,
        pending: total - resolved,
        resolved,
        urgent
      })
    } catch (error) {
      console.error('Failed to fetch grievances:', error)
      toast.error('Failed to fetch grievances')
    } finally {
      setLoading(false)
    }
  }
  const handleStatusUpdate = async (grievanceId, newStatus) => {
    setUpdatingId(grievanceId)
    try {
      await api.put(`/api/grievances/${grievanceId}/status`, {
        status: newStatus
      })
      
      setGrievances(grievances.map(g => 
        g.id === grievanceId ? { ...g, status: newStatus } : g
      ))
      
      // Update stats
      const total = grievances.length
      const resolved = grievances.filter(g => 
        g.id === grievanceId ? newStatus === 'Resolved' : g.status === 'Resolved'
      ).length
      
      setStats(prev => ({
        ...prev,
        resolved,
        pending: total - resolved
      }))
      
      toast.success('Status updated successfully')
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }
  const openAttachment = (grievance) => {
    setSelectedGrievance(grievance)
    setViewerOpen(true)
  }

  const downloadAttachment = (filePath) => {
    window.open(`http://localhost:5000/${filePath}`, '_blank')
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Skeleton width={300} height={40} sx={{ mb: 4 }} />
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <StatCard isLoading />
              </Grid>
            ))}
          </Grid>
          <Paper sx={{ p: 3 }}>
            <Skeleton width={200} height={32} sx={{ mb: 3 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['ID', 'Student', 'Department', 'Type', 'Description', 'Priority', 'Status', 'Submitted On', 'Attachment', 'Actions']
                      .map((header) => (
                        <TableCell key={header}>
                          <Skeleton width={100} />
                        </TableCell>
                      ))}
                  </TableRow>
                </TableHead>
                <TableBody>                  {[1, 2, 3].map((row) => (
                    <TableRow key={row}>
                      {[...Array(10)].map((_, colIndex) => (
                        <TableCell key={`${row}-${colIndex}`}>
                          <Skeleton width={colIndex === 4 ? 200 : 100} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerAnimation}
      >
        <Box sx={{ mt: 4 }}>
          <motion.div variants={itemAnimation}>
            <Typography variant="h4" gutterBottom>
              Staff Dashboard
            </Typography>
          </motion.div>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Grievances"
                value={stats.total}
                color={theme.palette.info.main}
                icon={<ListIcon sx={{ color: theme.palette.info.main }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pending"
                value={stats.pending}
                color={theme.palette.warning.main}
                icon={<Assessment sx={{ color: theme.palette.warning.main }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Resolved"
                value={stats.resolved}
                color={theme.palette.success.main}
                icon={<CheckCircle sx={{ color: theme.palette.success.main }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Urgent Cases"
                value={stats.urgent}
                color={theme.palette.error.main}
                icon={<Warning sx={{ color: theme.palette.error.main }} />}
              />
            </Grid>
          </Grid>          <motion.div variants={itemAnimation}>
            <Paper sx={{ p: 3 }} className="glass-effect">
              <Typography variant="h6" gutterBottom>
                All Grievances
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Student</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Submitted On</TableCell>
                      <TableCell>Attachment</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {grievances.map((grievance) => (
                      <TableRow
                        key={grievance.id}
                        component={motion.tr}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TableCell>{grievance.id}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {grievance.student_name}
                            <Typography variant="caption" display="block" color="textSecondary">
                              {grievance.program} - Level {grievance.level}
                            </Typography>
                          </Typography>
                        </TableCell>
                        <TableCell>{grievance.department}</TableCell>
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
                          {grievance.file_path && (
                            <Box>
                              <IconButton
                                onClick={() => openAttachment(grievance)}
                                size="small"
                              >
                                <Visibility />
                              </IconButton>
                              <IconButton
                                onClick={() => downloadAttachment(grievance.file_path)}
                                size="small"
                              >
                                <Download />
                              </IconButton>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" fullWidth>
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
          </motion.div>
        </Box>
      </motion.div>

      {/* Attachment Viewer Dialog with updated styling */}      <Dialog
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            className: 'glass-effect',
            sx: { borderRadius: '16px' }
          }
        }}
      >
        <DialogTitle>
          Attachment Preview
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setViewerOpen(false)}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedGrievance?.file_path && (
            selectedGrievance.file_path.toLowerCase().endsWith('.pdf') ? (              <iframe
                src={`http://localhost:5000/${selectedGrievance.file_path}`}
                width="100%"
                height="500px"
                style={{ border: 'none' }}
                title="Grievance Attachment PDF"
              />
            ) : (
              <img
                src={`http://localhost:5000/${selectedGrievance.file_path}`}
                style={{ maxWidth: '100%', height: 'auto' }}
                alt="Grievance Attachment"
              />
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewerOpen(false)}>Close</Button>
          <Button
            onClick={() => downloadAttachment(selectedGrievance?.file_path)}
            variant="contained"
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}