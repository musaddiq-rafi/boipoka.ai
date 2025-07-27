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
      maxlength: 5000, // Increased to allow longer AI responses
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
    // Character information
    character: {
      name: {
        type: String,
        required: true,
        maxlength: 100,
      },
      bookTitle: {
        type: String,
        required: true,
        maxlength: 200,
      },
      description: {
        type: String,
        maxlength: 500,
      },
      // Optional: Store character image/avatar
      avatar: {
        type: String,
      },
    },
    title: {
      type: String,
      maxlength: 100,
      default: function () {
        return `Chat with ${this.character.name}`;
      },
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
    // Add compound index for better query performance
    index: [
      { user: 1, createdAt: -1 },
      { user: 1, "character.name": 1, "character.bookTitle": 1 },
    ],
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

// Add a static method to find or create a chat with a specific character
chatSchema.statics.findOrCreateCharacterChat = function (
  userId,
  characterData
) {
  return this.findOne({
    user: userId,
    "character.name": characterData.name,
    "character.bookTitle": characterData.bookTitle,
    isActive: true,
  }).then((existingChat) => {
    if (existingChat) {
      return existingChat;
    }

    // Create new chat if none exists
    const newChat = new this({
      user: userId,
      character: characterData,
      messages: [],
      isActive: true,
      metadata: {
        totalTokens: 0,
        totalMessages: 0,
      },
    });

    return newChat.save();
  });
};

// Add a static method to get all characters the user has chatted with
chatSchema.statics.getUserCharacters = function (userId) {
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        isActive: true,
      },
    },
    {
      $group: {
        _id: {
          name: "$character.name",
          bookTitle: "$character.bookTitle",
        },
        character: { $first: "$character" },
        lastChatDate: { $max: "$updatedAt" },
        totalMessages: { $sum: "$metadata.totalMessages" },
      },
    },
    {
      $sort: { lastChatDate: -1 },
    },
    {
      $project: {
        _id: 0,
        character: 1,
        lastChatDate: 1,
        totalMessages: 1,
      },
    },
  ]);
};

// Pre-save middleware to update the title if it's still default and we have messages
chatSchema.pre("save", function (next) {
  if (
    this.title === `Chat with ${this.character.name}` &&
    this.messages.length > 0
  ) {
    // Generate title from first user message (truncated)
    const firstUserMessage = this.messages.find((msg) => msg.role === "user");
    if (firstUserMessage) {
      this.title =
        firstUserMessage.content.length > 40
          ? `${this.character.name}: ${firstUserMessage.content.substring(0, 40)}...`
          : `${this.character.name}: ${firstUserMessage.content}`;
    }
  }
  next();
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
