import express from "express";
import { ChatController } from "../controllers/chat.controller.js";

const chatRoute = express.Router();

// GET /api/chats - Get user's chat list
chatRoute.get("/", ChatController.getChatsList);

// GET /api/chats/characters - Get all characters the user has chatted with
chatRoute.get("/characters", ChatController.getUserCharacters);

// GET /api/chats/:id - Get specific chat with all messages
chatRoute.get("/:id", ChatController.getChatById);

// GET /api/chats/:id/history - Get chat conversation history (formatted for AI API)
chatRoute.get("/:id/history", ChatController.getChatHistory);

// POST /api/chats - Create new chat
chatRoute.post("/", ChatController.createChat);

// POST /api/chats/:id/messages - Add message to chat
chatRoute.post("/:id/messages", ChatController.addMessage);

// PATCH /api/chats/:id - Update chat (title, context, etc.)
chatRoute.patch("/:id", ChatController.updateChat);

// DELETE /api/chats/:id - Delete chat (soft delete)
chatRoute.delete("/:id", ChatController.deleteChat);

export default chatRoute;
