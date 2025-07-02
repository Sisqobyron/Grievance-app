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

const getPriorityConfig = (priority) => {
  switch (priority) {
    case 'Urgent':
      return { 
        color: 'error', 
        bgcolor: 'rgba(244, 67, 54, 0.1)', 
        borderColor: '#f44336',
        icon: '🚨',
        weight: 4
      }
    case 'High':
      return { 
        color: 'warning', 
        bgcolor: 'rgba(255, 152, 0, 0.1)', 
        borderColor: '#ff9800',
        icon: '⚡',
        weight: 3
      }
    case 'Medium':
      return { 
        color: 'info', 
        bgcolor: 'rgba(33, 150, 243, 0.1)', 
        borderColor: '#2196f3',
        icon: '📋',
        weight: 2
      }
    case 'Low':
      return { 
        color: 'success', 
        bgcolor: 'rgba(76, 175, 80, 0.1)', 
        borderColor: '#4caf50',
        icon: '📝',
        weight: 1
      }
    default:
      return { 
        color: 'default', 
        bgcolor: 'rgba(158, 158, 158, 0.1)', 
        borderColor: '#9e9e9e',
        icon: '📄',
        weight: 0
      }
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
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([])
  const [deadlinesLoading, setDeadlinesLoading] = useState(true)
  useEffect(() => {
    fetchGrievances()
    fetchUpcomingDeadlines()
  }, [])
  
  const fetchGrievances = async () => {
    try {
      // Use department-specific endpoint for staff
      const response = await api.get('/api/grievances/department')
      
      // Sort grievances by priority (Urgent -> High -> Medium -> Low)
      const sortedGrievances = response.data.sort((a, b) => {
        const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 }
        const aPriority = priorityOrder[a.priority_level] || 0
        const bPriority = priorityOrder[b.priority_level] || 0
        
        // Sort by priority first (highest first), then by submission date (newest first)
        if (aPriority !== bPriority) {
          return bPriority - aPriority
        }
        return new Date(b.submission_date) - new Date(a.submission_date)
      })
      
      setGrievances(sortedGrievances)
      
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
  
  const fetchUpcomingDeadlines = async () => {
    try {
      setDeadlinesLoading(true)
      // Fetch deadlines for staff department grievances
      const response = await api.get('/api/deadlines/upcoming')
      setUpcomingDeadlines(response.data.slice(0, 10)) // Show top 10 upcoming deadlines
    } catch (error) {
      console.error('Failed to fetch upcoming deadlines:', error)
      toast.error('Failed to fetch upcoming deadlines')
    } finally {
      setDeadlinesLoading(false)
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
          </Grid>

          {/* Upcoming Deadlines Section */}
          <motion.div variants={itemAnimation}>
            <Paper 
              sx={{ 
                p: 0,
                mb: 4,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }} 
              className="glass-effect"
            >
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
                color: 'white'
              }}>
                <Typography variant="h5" fontWeight={700} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  ⏰ Upcoming Deadlines
                  <Chip 
                    label={`${upcomingDeadlines.length} Active`}
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Typography>
                <Typography variant="body2" sx={{ 
                  opacity: 0.9, 
                  mt: 1,
                  fontWeight: 400
                }}>
                  Monitor approaching deadlines for timely grievance resolution
                </Typography>
              </Box>
              
              {deadlinesLoading ? (
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    {[1, 2, 3, 4].map((item) => (
                      <Grid item xs={12} sm={6} md={3} key={item}>
                        <Card sx={{ p: 2 }}>
                          <Skeleton width="100%" height={20} sx={{ mb: 1 }} />
                          <Skeleton width="60%" height={16} sx={{ mb: 1 }} />
                          <Skeleton width="40%" height={24} />
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : upcomingDeadlines.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    🎉 No Upcoming Deadlines
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    All grievances are on track or resolved
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    {upcomingDeadlines.map((deadline) => {
                      const daysLeft = Math.ceil((new Date(deadline.deadline_date) - new Date()) / (1000 * 60 * 60 * 24));
                      const isOverdue = daysLeft < 0;
                      const isUrgent = daysLeft <= 2 && daysLeft >= 0;
                      const isWarning = daysLeft <= 5 && daysLeft > 2;
                      
                      return (
                        <Grid item xs={12} sm={6} md={3} key={deadline.id}>
                          <Card 
                            sx={{ 
                              p: 2,
                              height: '100%',
                              background: isOverdue 
                                ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)'
                                : isUrgent 
                                  ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)'
                                  : isWarning
                                    ? 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)'
                                    : 'background.paper',
                              border: isOverdue 
                                ? '2px solid rgba(244, 67, 54, 0.3)'
                                : isUrgent 
                                  ? '2px solid rgba(255, 152, 0, 0.3)'
                                  : '1px solid rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: isOverdue 
                                  ? '0 8px 25px rgba(244, 67, 54, 0.2)'
                                  : isUrgent 
                                    ? '0 8px 25px rgba(255, 152, 0, 0.2)'
                                    : '0 8px 25px rgba(0, 0, 0, 0.1)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                                Grievance #{deadline.grievance_id}
                              </Typography>
                              <Box sx={{ fontSize: '1.2rem' }}>
                                {isOverdue ? '🚨' : isUrgent ? '⚡' : isWarning ? '⚠️' : '⏰'}
                              </Box>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Due: {new Date(deadline.deadline_date).toLocaleDateString()}
                            </Typography>
                            
                            <Chip 
                              label={
                                isOverdue 
                                  ? `OVERDUE (${Math.abs(daysLeft)} days)` 
                                  : isUrgent 
                                    ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} left` 
                                    : `${daysLeft} days left`
                              }
                              size="small"
                              color={isOverdue ? 'error' : isUrgent ? 'warning' : isWarning ? 'warning' : 'success'}
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                '& .MuiChip-label': {
                                  px: 1.5
                                }
                              }}
                            />
                            
                            {deadline.grievance_type && (
                              <Typography variant="caption" sx={{ 
                                display: 'block',
                                mt: 1,
                                opacity: 0.7,
                                fontWeight: 500
                              }}>
                                Type: {deadline.grievance_type}
                              </Typography>
                            )}
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}
            </Paper>
          </motion.div>

          <motion.div variants={itemAnimation}>
            <Paper 
              sx={{ 
                p: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }} 
              className="glass-effect"
            >
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <Typography variant="h5" fontWeight={700} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  📋 All Grievances
                  <Chip 
                    label={`${grievances.length} Total`}
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Typography>
                <Typography variant="body2" sx={{ 
                  opacity: 0.9, 
                  mt: 1,
                  fontWeight: 400
                }}>
                  Sorted by priority • Urgent cases shown first
                </Typography>
              </Box>
              
              <TableContainer sx={{ maxHeight: '70vh' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderBottom: '2px solid #667eea'
                      }}>
                        ID
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderBottom: '2px solid #667eea'
                      }}>
                        Student
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderBottom: '2px solid #667eea'
                      }}>
                        Department
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderBottom: '2px solid #667eea'
                      }}>
                        Type
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderBottom: '2px solid #667eea'
                      }}>
                        Description
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderBottom: '2px solid #667eea'
                      }}>
                        🔥 Priority
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderBottom: '2px solid #667eea'
                      }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderBottom: '2px solid #667eea'
                      }}>
                        Submitted On
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderBottom: '2px solid #667eea'
                      }}>
                        Attachment
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderBottom: '2px solid #667eea'
                      }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>                  <TableBody>
                    {grievances.map((grievance, index) => {
                      const priorityConfig = getPriorityConfig(grievance.priority_level)
                      return (
                        <TableRow
                          key={grievance.id}
                          component={motion.tr}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(102, 126, 234, 0.05)',
                              transform: 'scale(1.01)',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            },
                            borderLeft: `4px solid ${priorityConfig.borderColor}`,
                            transition: 'all 0.2s ease-in-out',
                            cursor: 'pointer'
                          }}
                        >
                        <TableCell sx={{ fontWeight: 600, color: '#667eea' }}>
                          #{grievance.id}
                        </TableCell>                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '1rem'
                            }}>
                              {grievance.student_name?.charAt(0) || 'S'}
                            </Box>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                                {grievance.student_name}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                color: 'text.secondary',
                                display: 'block',
                                fontSize: '0.7rem'
                              }}>
                                {grievance.program} - Level {grievance.level}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>                        <TableCell sx={{ fontWeight: 500 }}>{grievance.department}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{grievance.type}</TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: 1.4,
                              color: '#555'
                            }}
                            title={grievance.description}
                          >
                            {grievance.description}
                          </Typography>
                        </TableCell><TableCell>
                          {(() => {
                            const priorityConfig = getPriorityConfig(grievance.priority_level)
                            return (
                              <Chip
                                icon={<span style={{ fontSize: '14px' }}>{priorityConfig.icon}</span>}
                                label={grievance.priority_level}
                                color={priorityConfig.color}
                                variant="outlined"
                                sx={{
                                  backgroundColor: priorityConfig.bgcolor,
                                  borderColor: priorityConfig.borderColor,
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  '& .MuiChip-icon': {
                                    marginLeft: 1
                                  }
                                }}
                              />
                            )
                          })()}
                        </TableCell>                        <TableCell>
                          <Chip
                            label={grievance.status}
                            color={getStatusColor(grievance.status)}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              minWidth: 80,
                              '&.MuiChip-colorSuccess': {
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                color: '#2e7d32',
                                border: '1px solid #4caf50'
                              },
                              '&.MuiChip-colorWarning': {
                                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                color: '#ef6c00',
                                border: '1px solid #ff9800'
                              },
                              '&.MuiChip-colorError': {
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                color: '#c62828',
                                border: '1px solid #f44336'
                              },
                              '&.MuiChip-colorInfo': {
                                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                color: '#1565c0',
                                border: '1px solid #2196f3'
                              }
                            }}
                          />
                        </TableCell>                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                              {new Date(grievance.submission_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                              {new Date(grievance.submission_date).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </Box>
                        </TableCell>                        <TableCell>
                          {grievance.file_path ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                onClick={() => openAttachment(grievance)}
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                  color: '#1976d2',
                                  '&:hover': {
                                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                              <IconButton
                                onClick={() => downloadAttachment(grievance.file_path)}
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                  color: '#388e3c',
                                  '&:hover': {
                                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <Download fontSize="small" />
                              </IconButton>
                            </Box>
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                              No attachment
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" fullWidth>                            <Select
                              value=""
                              displayEmpty
                              disabled={updatingId === grievance.id}
                              onChange={(e) => handleStatusUpdate(grievance.id, e.target.value)}
                              sx={{
                                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                borderRadius: 2,
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(102, 126, 234, 0.3)'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#667eea'
                                }
                              }}
                            >
                              <MenuItem value="" disabled>
                                <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                  Update Status
                                </Typography>
                              </MenuItem>
                              <MenuItem value="In Progress">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  ⚡ Mark In Progress
                                </Box>
                              </MenuItem>
                              <MenuItem value="Resolved">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  ✅ Mark Resolved
                                </Box>
                              </MenuItem>
                              <MenuItem value="Rejected">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  ❌ Reject
                                </Box>
                              </MenuItem>
                            </Select>
                          </FormControl>                        </TableCell>
                      </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>              {grievances.length === 0 && (
                <Box sx={{ 
                  py: 8, 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                }}>
                  <Typography variant="h6" sx={{ 
                    color: 'text.secondary', 
                    mb: 2,
                    fontSize: '3rem'
                  }}>
                    📋
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea', mb: 1 }}>
                    No grievances found
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    All caught up! No grievances to review at the moment.
                  </Typography>
                </Box>
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