import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    room: {
      type: String,
      default: 'general',
      enum: ['general', 'flirt', 'friends', 'random']
    },
    gender: String,
    country: String,
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    },
    attachments: [
      {
        url: String,
        type: {
          type: String,
          enum: ['image', 'video', 'file'],
          default: 'image'
        }
      }
    ],
    reactions: [
      {
        emoji: String,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      }
    ]
  },
  { timestamps: true }
);

// Index for faster queries
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ createdAt: -1 });

export default mongoose.model("Message", messageSchema);
