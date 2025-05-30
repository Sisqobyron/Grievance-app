const Message = require('../models/messageModel');
const notifier = require('../utils/notifications');
const userModel = require('../models/userModel');
const grievanceModel = require('../models/grievanceModel');

const messageController = {  sendMessage: async (req, res) => {
    try {
      const { grievanceId, receiverId, content } = req.body;
      const senderId = req.user.id;

      await Message.create(grievanceId, senderId, receiverId, content);
      
      // Get sender, receiver, and grievance information for beautiful email
      userModel.findUserById(senderId, (senderErr, sender) => {
        if (senderErr) {
          console.error('Error fetching sender info:', senderErr);
          return;
        }

        userModel.findUserById(receiverId, (receiverErr, receiver) => {
          if (receiverErr) {
            console.error('Error fetching receiver info:', receiverErr);
            return;
          }

          grievanceModel.getGrievanceById(grievanceId, (grievanceErr, grievance) => {
            if (grievanceErr) {
              console.error('Error fetching grievance info:', grievanceErr);
              return;
            }

            const grievanceData = {
              id: grievance.id,
              type: grievance.type,
              subcategory: grievance.subcategory,
              description: grievance.description
            };

            // Create message preview (first 100 characters)
            const messagePreview = content.length > 100 ? 
              content.substring(0, 100) + '...' : content;

            // Send beautiful new message email notification
            notifier.sendNewMessageEmail(
              receiverId,
              grievanceData,
              sender.name || sender.email,
              messagePreview,
              receiver.name || receiver.email,
              (emailErr) => {
                if (emailErr) console.error('Error sending new message email:', emailErr);
              }
            );
          });
        });
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
