import {
  getAllSupportMessages,
  getSupportMessagesByUserId,
  addSupportMessage,
  markSupportMessagesRead,
  deleteSupportThreadByUserId,
  deleteSupportMessageById,
  getAllUsers,
  getUserById
} from '../database.js';

// GET /api/support/messages
export function getUserMessages(req, res) {
  try {
    const userId = req.user?.id || req.query.userId;
    if (!userId) {
      return res.json({ success: true, messages: [] });
    }

    const messages = getSupportMessagesByUserId(userId);
    // Mark messages as read by the user
    markSupportMessagesRead(userId, 'USER');

    res.json({ success: true, messages });
  } catch (err) {
    console.error('Error fetching support messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages: ' + err.message });
  }
}

// POST /api/support/messages
export function sendUserMessage(req, res) {
  try {
    const { text, userId: guestId, userName: guestName, userEmail: guestEmail } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text cannot be empty' });
    }

    let userId = req.user?.id;
    let userName = req.user?.fullName || req.user?.username;
    let userEmail = req.user?.email;

    if (!userId) {
      // Guest or visitor
      userId = guestId || ('guest-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6));
      userName = guestName || 'Guest Trader';
      userEmail = guestEmail || '';
    }

    const existingMessages = getSupportMessagesByUserId(userId);
    const isFirstMessage = existingMessages.length === 0;

    const userMessage = addSupportMessage({
      userId,
      userName,
      userEmail,
      sender: 'USER',
      text: text.trim()
    });

    let botGreeting = null;
    if (isFirstMessage) {
      botGreeting = addSupportMessage({
        userId,
        userName: 'Customer Support',
        userEmail: 'support@tradingtrends.com',
        sender: 'BOT',
        text: `Hello ${userName}! Your message has been received by Customer Support. A support representative will reply to you right here shortly.`
      });
    }

    res.json({
      success: true,
      message: userMessage,
      botGreeting,
      userId
    });
  } catch (err) {
    console.error('Error sending support message:', err);
    res.status(500).json({ error: 'Failed to send message: ' + err.message });
  }
}

// GET /api/admin/support/conversations (Admin only)
export function getAdminConversations(req, res) {
  try {
    const allMessages = getAllSupportMessages();
    const allUsers = getAllUsers();
    const userMap = new Map();
    allUsers.forEach(u => userMap.set(u.id, u));

    // Group messages by userId
    const threadMap = new Map();

    allMessages.forEach(msg => {
      if (!threadMap.has(msg.userId)) {
        const registered = userMap.get(msg.userId);
        threadMap.set(msg.userId, {
          userId: msg.userId,
          userName: registered?.fullName || registered?.username || msg.userName || 'Trader',
          userEmail: registered?.email || msg.userEmail || '',
          isRegisteredUser: !!registered,
          userProfile: registered ? {
            id: registered.id,
            username: registered.username,
            fullName: registered.fullName,
            email: registered.email,
            phone: registered.phone,
            initialBalance: registered.initialBalance,
            status: registered.status
          } : null,
          messages: [],
          unreadCount: 0,
          lastMessage: null
        });
      }

      const thread = threadMap.get(msg.userId);
      thread.messages.push(msg);
      if (msg.sender === 'USER' && !msg.readByAdmin) {
        thread.unreadCount += 1;
      }
      thread.lastMessage = msg;
    });

    const conversations = Array.from(threadMap.values()).map(conv => {
      // Sort messages within thread chronologically
      conv.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      conv.lastMessage = conv.messages[conv.messages.length - 1];
      return conv;
    });

    // Sort conversations: unread first, then by latest message date
    conversations.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
      const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : 0;
      const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : 0;
      return dateB - dateA;
    });

    const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

    res.json({
      success: true,
      conversations,
      totalUnread
    });
  } catch (err) {
    console.error('Error fetching admin conversations:', err);
    res.status(500).json({ error: 'Failed to fetch conversations: ' + err.message });
  }
}

// POST /api/admin/support/reply (Admin only)
export function sendAdminReply(req, res) {
  try {
    const { userId, text } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Target userId is required' });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Reply text cannot be empty' });
    }

    const reply = addSupportMessage({
      userId,
      userName: 'Customer Support',
      userEmail: 'support@tradingtrends.com',
      sender: 'ADMIN',
      text: text.trim()
    });

    res.json({ success: true, message: reply });
  } catch (err) {
    console.error('Error sending admin reply:', err);
    res.status(500).json({ error: 'Failed to send admin reply: ' + err.message });
  }
}

// PUT /api/admin/support/read/:userId (Admin only)
export function markAdminThreadRead(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    markSupportMessagesRead(userId, 'ADMIN');
    res.json({ success: true, message: 'Thread marked as read' });
  } catch (err) {
    console.error('Error marking thread as read:', err);
    res.status(500).json({ error: 'Failed to mark thread as read: ' + err.message });
  }
}

// DELETE /api/admin/support/conversations/:userId (Admin only)
export function clearAdminConversation(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const deletedCount = deleteSupportThreadByUserId(userId);
    res.json({ success: true, message: `Conversation cleared (${deletedCount} messages deleted)` });
  } catch (err) {
    console.error('Error clearing conversation:', err);
    res.status(500).json({ error: 'Failed to clear conversation: ' + err.message });
  }
}

// DELETE /api/admin/support/messages/:messageId (Admin only)
export function deleteSingleMessage(req, res) {
  try {
    const { messageId } = req.params;
    if (!messageId) {
      return res.status(400).json({ error: 'messageId is required' });
    }

    const deleted = deleteSupportMessageById(messageId);
    if (!deleted) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ success: true, message: 'Message removed successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Failed to delete message: ' + err.message });
  }
}


