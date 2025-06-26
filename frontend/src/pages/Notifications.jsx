import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../config/axios'
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  CircularProgress,
  Divider,
  Badge
} from '@mui/material'
import { MarkEmailRead as MarkReadIcon } from '@mui/icons-material'

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [user])
  const fetchNotifications = async () => {
    try {
      const response = await api.get(
        `/api/notifications/${user.id}`
      )
      setNotifications(response.data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }
  const markAsRead = async (notificationId) => {
    try {
      await api.put(
        `/api/notifications/${notificationId}/read`
      )
      setNotifications(notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, status: 'read' }
          : notification
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  const unreadCount = notifications.filter(n => n.status === 'unread').length

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Badge
              badgeContent={unreadCount}
              color="primary"
              sx={{ ml: 2 }}
            />
          )}
        </Box>

        <List>
          {notifications.map((notification, index) => (
            <div key={notification.id}>
              <ListItem
                sx={{
                  bgcolor: notification.status === 'unread' ? 'action.hover' : 'inherit'
                }}
              >
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.date_sent).toLocaleString()}
                />
                {notification.status === 'unread' && (
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <MarkReadIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </div>
          ))}
          {notifications.length === 0 && (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
              No notifications found.
            </Typography>
          )}
        </List>
      </Paper>
    </Container>
  )
}