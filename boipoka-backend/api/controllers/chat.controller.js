import Chat from "../models/chat.models.js";
import mongoose from "mongoose";
import { logError } from "../utils/logger.js";
import { sendSuccess, sendError } from "../utils/response.js";
import HTTP from "../utils/httpStatus.js";

const getChatsList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const PAGE_SIZE = parseInt(limit);
    const userId = req.user._id;

    const chats = await Chat.find({ user: userId, isActive: true })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate("user", "displayName username avatar")
      .select("-messages"); // Don't include messages in list view for performance

    return sendSuccess(res, HTTP.OK, "Chats fetched successfully", { chats });
  } catch (err) {
    logError("Failed to fetch chats", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch chats");
  }
};

const getChatById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid chat ID");
    }

    const chat = await Chat.findOne({
      _id: id,
      user: userId,
      isActive: true,
    }).populate("user", "displayName username avatar");

    if (!chat) {
      return sendError(res, HTTP.NOT_FOUND, "Chat not found");
    }

    return sendSuccess(res, HTTP.OK, "Chat fetched successfully", { chat });
  } catch (err) {
    logError("Failed to fetch chat", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch chat");
  }
};

const createChat = async (req, res) => {
  try {
    const { data } = req.body;
    const userId = req.user._id;

    if (!data) {
      return sendError(res, HTTP.BAD_REQUEST, "Missing chat data");
    }

    const { title, context, model = "gemini-pro" } = data;

    const newChat = new Chat({
      user: userId,
      title: title || "New Chat",
      context,
      model,
      messages: [],
      isActive: true,
      metadata: {
        totalTokens: 0,
        totalMessages: 0,
      },
    });

    await newChat.save();
    await newChat.populate("user", "displayName username avatar");

    return sendSuccess(res, HTTP.CREATED, "Chat created successfully", {
      chat: newChat,
    });
  } catch (err) {
    logError("Failed to create chat", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to create chat");
  }
};

const addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid chat ID");
    }

    if (!data || !data.role || !data.content) {
      return sendError(res, HTTP.BAD_REQUEST, "Missing message data");
    }

    const { role, content } = data;

    if (!["user", "assistant"].includes(role)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid message role");
    }

    const chat = await Chat.findOne({ _id: id, user: userId, isActive: true });

    if (!chat) {
      return sendError(res, HTTP.NOT_FOUND, "Chat not found");
    }

    // Add the message using the schema method
    await chat.addMessage(role, content);
    await chat.populate("user", "displayName username avatar");

    return sendSuccess(res, HTTP.OK, "Message added successfully", { chat });
  } catch (err) {
    logError("Failed to add message", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to add message");
  }
};

const updateChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid chat ID");
    }

    if (!data) {
      return sendError(res, HTTP.BAD_REQUEST, "Missing data to update");
    }

    const chat = await Chat.findOne({ _id: id, user: userId, isActive: true });

    if (!chat) {
      return sendError(res, HTTP.NOT_FOUND, "Chat not found");
    }

    // Update allowed fields
    if (data.title !== undefined) chat.title = data.title;
    if (data.context !== undefined) chat.context = data.context;
    if (data.model !== undefined) chat.model = data.model;

    await chat.save();
    await chat.populate("user", "displayName username avatar");

    return sendSuccess(res, HTTP.OK, "Chat updated successfully", { chat });
  } catch (err) {
    logError("Failed to update chat", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to update chat");
  }
};

const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid chat ID");
    }

    const chat = await Chat.findOne({ _id: id, user: userId, isActive: true });

    if (!chat) {
      return sendError(res, HTTP.NOT_FOUND, "Chat not found");
    }

    // Soft delete by setting isActive to false
    chat.isActive = false;
    await chat.save();

    return sendSuccess(res, HTTP.OK, "Chat deleted successfully");
  } catch (err) {
    logError("Failed to delete chat", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to delete chat");
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid chat ID");
    }

    const chat = await Chat.findOne({ _id: id, user: userId, isActive: true });

    if (!chat) {
      return sendError(res, HTTP.NOT_FOUND, "Chat not found");
    }

    const history = chat.getConversationHistory(parseInt(limit));

    return sendSuccess(res, HTTP.OK, "Chat history fetched successfully", {
      history,
      chatId: chat._id,
      title: chat.title,
    });
  } catch (err) {
    logError("Failed to fetch chat history", err);
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to fetch chat history"
    );
  }
};

export const ChatController = {
  getChatsList,
  getChatById,
  createChat,
  addMessage,
  updateChat,
  deleteChat,
  getChatHistory,
};
