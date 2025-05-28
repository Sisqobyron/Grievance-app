const Message = require('../models/messageModel');
const { sendNotification } = require('../utils/notifications');

const messageController = {
  sendMessage: async (req, res) => {
    try {
      const { grievanceId, receiverId, content } = req.body;
      const senderId = req.user.id;

      await Message.create(grievanceId, senderId, receiverId, content);
      
      // Send notification to the receiver
      await sendNotification({
        userId: receiverId,
        type: 'new_message',
        content: `You have a new message regarding grievance #${grievanceId}`,
        link: `/view-grievances/${grievanceId}`
      });

      res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Error sending message' });
    }
  },

  getMessages: async (req, res) => {
    try {
      const { grievanceId } = req.params;
      const messages = await Message.getMessagesByGrievance(grievanceId);
      res.json(messages);
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({ message: 'Error retrieving messages' });
    }
  }
};

module.exports = messageController;
