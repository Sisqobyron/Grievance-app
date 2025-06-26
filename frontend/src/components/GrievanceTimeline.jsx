import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  Avatar,
  Skeleton,
  Alert,
  Collapse,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  Circle,
  CheckCircle,
  Error,
  Warning,
  Assignment,
  Message,
  Person,
  Schedule,
  ExpandMore,
  ExpandLess,
  Refresh
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const GrievanceTimeline = ({ grievanceId }) => {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    if (grievanceId) {
      fetchTimeline();
    }
  }, [grievanceId]);

  const fetchTimeline = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/timeline/${grievanceId}`);
      setTimelineData(response.data);
    } catch (error) {
      console.error('Error fetching timeline:', error);
      toast.error('Failed to fetch timeline');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'submitted':
        return <Assignment color="primary" />;
      case 'status_change':
        return <CheckCircle color="success" />;
      case 'message_sent':
        return <Message color="info" />;
      case 'coordinator_assigned':
        return <Person color="secondary" />;
      case 'deadline_set':
        return <Schedule color="warning" />;
      case 'escalated':
        return <Warning color="error" />;
      case 'resolved':
        return <CheckCircle color="success" />;
      default:
        return <Circle color="default" />;
    }
  };

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'submitted':
        return 'primary';
      case 'status_change':
        return 'success';
      case 'message_sent':
        return 'info';
      case 'coordinator_assigned':
        return 'secondary';
      case 'deadline_set':
        return 'warning';
      case 'escalated':
        return 'error';
      case 'resolved':
        return 'success';
      default:
        return 'grey';
    }
  };

  const formatActivityDescription = (activity) => {
    const metadata = activity.metadata ? JSON.parse(activity.metadata) : {};
    
    switch (activity.activity_type) {
      case 'submitted':
        return 'Grievance submitted to the system';
      case 'status_change':
        return `Status changed from "${metadata.from}" to "${metadata.to}"`;
      case 'message_sent':
        return `Message sent by ${metadata.sender_role}`;
      case 'coordinator_assigned':
        return `Assigned to coordinator: ${metadata.coordinator_name}`;
      case 'deadline_set':
        return `Deadline set: ${new Date(metadata.deadline).toLocaleDateString()}`;
      case 'escalated':
        return `Escalated due to: ${metadata.reason}`;
      case 'resolved':
        return 'Grievance marked as resolved';
      default:
        return activity.description || 'Activity recorded';
    }
  };

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = (now - time) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Timeline
        </Typography>
        <Timeline>
          {[1, 2, 3].map((item) => (
            <TimelineItem key={item}>
              <TimelineOppositeContent sx={{ m: 'auto 0' }} variant="body2" color="textSecondary">
                <Skeleton width={100} />
              </TimelineOppositeContent>
              <TimelineSeparator>
                <Skeleton variant="circular" width={40} height={40} />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Skeleton width="80%" height={20} />
                <Skeleton width="60%" height={16} sx={{ mt: 1 }} />
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Timeline - Grievance #{grievanceId}
        </Typography>
        <Tooltip title="Refresh Timeline">
          <IconButton onClick={fetchTimeline} size="small">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {timelineData.length === 0 ? (
        <Alert severity="info">
          No timeline data available for this grievance.
        </Alert>
      ) : (
        <Timeline position="alternate">
          <AnimatePresence>
            {timelineData.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TimelineItem>
                  <TimelineOppositeContent sx={{ m: 'auto 0' }} variant="body2" color="textSecondary">
                    <Typography variant="caption" display="block">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </Typography>
                    <Chip
                      label={formatTimeAgo(activity.timestamp)}
                      size="small"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </TimelineOppositeContent>
                  
                  <TimelineSeparator>
                    <TimelineDot color={getActivityColor(activity.activity_type)} variant="outlined">
                      {getActivityIcon(activity.activity_type)}
                    </TimelineDot>
                    {index < timelineData.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Card
                      elevation={1}
                      sx={{
                        '&:hover': {
                          elevation: 3,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" component="h6" sx={{ fontWeight: 600 }}>
                              {activity.activity_type.replace('_', ' ').toUpperCase()}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                              {formatActivityDescription(activity)}
                            </Typography>
                            
                            {activity.description && activity.description !== formatActivityDescription(activity) && (
                              <Box sx={{ mt: 1 }}>
                                <Collapse in={expandedItems.has(activity.id)}>
                                  <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                    {activity.description}
                                  </Typography>
                                </Collapse>
                                <IconButton
                                  size="small"
                                  onClick={() => toggleExpanded(activity.id)}
                                  sx={{ mt: 0.5 }}
                                >
                                  {expandedItems.has(activity.id) ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                              </Box>
                            )}
                          </Box>
                          
                          {activity.user_id && (
                            <Avatar sx={{ ml: 2, width: 32, height: 32, bgcolor: getActivityColor(activity.activity_type) + '.light' }}>
                              <Person fontSize="small" />
                            </Avatar>
                          )}
                        </Box>
                        
                        {/* Metadata Display */}
                        {activity.metadata && (
                          <Box sx={{ mt: 2 }}>
                            {(() => {
                              const metadata = JSON.parse(activity.metadata);
                              return Object.entries(metadata).map(([key, value]) => (
                                <Chip
                                  key={key}
                                  label={`${key}: ${value}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mr: 1, mb: 1 }}
                                />
                              ));
                            })()}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </TimelineContent>
                </TimelineItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </Timeline>
      )}
    </Paper>
  );
};

export default GrievanceTimeline;
