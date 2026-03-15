import Message from "../models/Message.js";
import User from "../models/User.js";

// ─── GET /inbox — paginated inbox for current user ──────
export const getInbox = async (req, res) => {
  try {
    const userId = req.user.clerkId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type; // optional filter

    // Show threads where user is sender OR recipient
    const filter = {
      $or: [{ recipientId: userId }, { senderId: userId }],
      parentMessageId: null, // only top-level messages
    };
    if (type && type !== "all") {
      filter.type = type;
    }

    const totalCount = await Message.countDocuments(filter);
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get reply counts for each message
    const messageIds = messages.map((m) => m._id);
    const replyCounts = await Message.aggregate([
      { $match: { parentMessageId: { $in: messageIds } } },
      { $group: { _id: "$parentMessageId", count: { $sum: 1 } } },
    ]);
    const replyMap = {};
    replyCounts.forEach((r) => {
      replyMap[r._id.toString()] = r.count;
    });

    // Get latest reply timestamps for sorting by activity
    const latestReplies = await Message.aggregate([
      { $match: { parentMessageId: { $in: messageIds } } },
      { $group: { _id: "$parentMessageId", latestReply: { $max: "$createdAt" } } },
    ]);
    const latestReplyMap = {};
    latestReplies.forEach((r) => {
      latestReplyMap[r._id.toString()] = r.latestReply;
    });

    const enriched = messages.map((m) => ({
      ...m,
      replyCount: replyMap[m._id.toString()] || 0,
      lastActivity: latestReplyMap[m._id.toString()] || m.createdAt,
      isSentByMe: m.senderId === userId,
    }));

    // Sort by last activity (most recent reply or creation)
    enriched.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

    res.json({
      messages: enriched,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Error in getInbox:", error.message);
    res.status(500).json({ message: "Failed to fetch inbox" });
  }
};

// ─── GET /inbox/unread-count ──────
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.clerkId;

    // Count unread messages received by user (both top-level and replies)
    const count = await Message.countDocuments({
      recipientId: userId,
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
};

// ─── GET /inbox/:id — single message + replies, mark as read ──────
export const getMessage = async (req, res) => {
  try {
    const userId = req.user.clerkId;
    const message = await Message.findById(req.params.id).lean();

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only recipient or sender can view
    if (message.recipientId !== userId && message.senderId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Mark as read if recipient is viewing
    if (message.recipientId === userId && !message.isRead) {
      await Message.findByIdAndUpdate(req.params.id, { isRead: true });
      message.isRead = true;
    }

    // Fetch all replies
    const replies = await Message.find({ parentMessageId: message._id })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ message, replies });
  } catch (error) {
    console.error("Error in getMessage:", error.message);
    res.status(500).json({ message: "Failed to fetch message" });
  }
};

// ─── POST /inbox — send a new message (compose) ──────
export const sendMessage = async (req, res) => {
  try {
    const { recipientEmail, recipientId, type, subject, body, sessionId } =
      req.body;

    // Resolve recipient by email or clerkId
    let resolvedRecipientId = recipientId;
    if (!resolvedRecipientId && recipientEmail) {
      const recipient = await User.findOne({ email: recipientEmail });
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      resolvedRecipientId = recipient.clerkId;
    }

    if (!resolvedRecipientId) {
      return res
        .status(400)
        .json({ message: "Recipient email or ID is required" });
    }

    // Only interviewers/recruiters/admins can send official message types
    const officialTypes = [
      "offer_letter",
      "appointment",
      "rejection",
      "feedback",
    ];
    if (officialTypes.includes(type) && req.user.role === "candidate") {
      return res
        .status(403)
        .json({ message: "Candidates cannot send official messages" });
    }

    const message = await Message.create({
      senderId: req.user.clerkId,
      senderName: req.user.name,
      senderRole: req.user.role,
      recipientId: resolvedRecipientId,
      type: type || "general",
      subject,
      body,
      sessionId: sessionId || null,
    });

    // Real-time: notify recipient only (sender already has the data from API response)
    const io = req.app.get("io");
    if (io) {
      const msgData = message.toObject();
      io.to(`inbox:${resolvedRecipientId}`).emit("inbox:new-message", msgData);
      io.to(`inbox:${resolvedRecipientId}`).emit("inbox:unread");
    }

    res.status(201).json({ message });
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// ─── POST /inbox/:id/reply — reply to a message ──────
export const replyToMessage = async (req, res) => {
  try {
    const userId = req.user.clerkId;
    const parentMessage = await Message.findById(req.params.id);

    if (!parentMessage) {
      return res.status(404).json({ message: "Parent message not found" });
    }

    // Both sender and recipient of parent can reply
    if (
      parentMessage.recipientId !== userId &&
      parentMessage.senderId !== userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Determine the reply recipient (the other party)
    const replyRecipientId =
      parentMessage.senderId === userId
        ? parentMessage.recipientId
        : parentMessage.senderId;

    const reply = await Message.create({
      senderId: userId,
      senderName: req.user.name,
      senderRole: req.user.role,
      recipientId: replyRecipientId,
      type: parentMessage.type,
      subject: `Re: ${parentMessage.subject}`,
      body: req.body.body,
      sessionId: parentMessage.sessionId,
      parentMessageId: parentMessage._id,
    });

    // Real-time: notify recipient only (sender already has the data from API response)
    const io = req.app.get("io");
    if (io) {
      const replyData = reply.toObject();
      io.to(`inbox:${replyRecipientId}`).emit("inbox:new-reply", replyData);
      io.to(`inbox:${replyRecipientId}`).emit("inbox:unread");
    }

    res.status(201).json({ reply });
  } catch (error) {
    console.error("Error in replyToMessage:", error.message);
    res.status(500).json({ message: "Failed to send reply" });
  }
};
