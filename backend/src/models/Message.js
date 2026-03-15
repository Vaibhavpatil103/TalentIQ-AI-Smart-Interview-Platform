import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String, // Clerk userId
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["candidate", "interviewer", "recruiter", "admin"],
      required: true,
    },
    recipientId: {
      type: String, // Clerk userId
      required: true,
    },
    type: {
      type: String,
      enum: ["feedback", "offer_letter", "appointment", "rejection", "general"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      default: null,
    },
    feedbackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    parentMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ recipientId: 1, createdAt: -1 });
messageSchema.index({ parentMessageId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
