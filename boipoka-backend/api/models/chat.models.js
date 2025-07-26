import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000, // Adjust based on your needs
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      maxlength: 100,
      default: "New Chat",
    },
    messages: [messageSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    // Optional: Store context about what the chat is about
    context: {
      type: String,
      maxlength: 500,
    },
    // Optional: Store the model used for this conversation
    model: {
      type: String,
      default: "gemini-pro", // or whatever Gemini model you're using
    },
    // Optional: Store conversation metadata
    metadata: {
      totalTokens: { type: Number, default: 0 },
      totalMessages: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    // Add index for better query performance
    index: { user: 1, createdAt: -1 },
  }
);

// Add a method to add a message to the chat
chatSchema.methods.addMessage = function (role, content) {
  this.messages.push({ role, content });
  this.metadata.totalMessages = this.messages.length;
  return this.save();
};

// Add a method to get the conversation history for API calls
chatSchema.methods.getConversationHistory = function (limit = 20) {
  return this.messages
    .slice(-limit) // Get last 'limit' messages
    .map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
};

// Add a static method to find user's active chats
chatSchema.statics.findUserActiveChats = function (userId, limit = 10) {
  return this.find({ user: userId, isActive: true })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate("user", "username displayName avatar");
};

// Pre-save middleware to update the title if it's still "New Chat" and we have messages
chatSchema.pre("save", function (next) {
  if (this.title === "New Chat" && this.messages.length > 0) {
    // Generate title from first user message (truncated)
    const firstUserMessage = this.messages.find((msg) => msg.role === "user");
    if (firstUserMessage) {
      this.title =
        firstUserMessage.content.length > 50
          ? firstUserMessage.content.substring(0, 50) + "..."
          : firstUserMessage.content;
    }
  }
  next();
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
