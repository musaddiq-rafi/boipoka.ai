## **Behavior:**
- All routes are protected with `verifyUser` middleware
- Users can only access their own chats
- Proper validation for ObjectIds and required fields
- Soft delete functionality (sets `isActive: false`)


## **API Endpoints Available:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/chats` | Get user's chat list (paginated) |
| `GET` | `/api/chats/:id` | Get specific chat with all messages |
| `GET` | `/api/chats/:id/history` | Get formatted conversation history for AI API |
| `POST` | `/api/chats` | Create new chat |
| `POST` | `/api/chats/:id/messages` | Add message to chat |
| `PATCH` | `/api/chats/:id` | Update chat (title, context, etc.) |
| `DELETE` | `/api/chats/:id` | Delete chat (soft delete) |

## **Usage Examples:**

### **1. Create a new chat:**
```javascript
POST /api/chats
{
  "data": {
    "title": "Book Recommendations",
    "context": "Discussion about sci-fi books",
    "model": "gemini-pro"
  }
}
```

### **2. Add a message:**
```javascript
POST /api/chats/:chatId/messages
{
  "data": {
    "role": "user",
    "content": "Can you recommend some sci-fi books?"
  }
}
```

### **3. Get chat history (for AI API):**
```javascript
GET /api/chats/:chatId/history?limit=20
// Returns formatted conversation history for Gemini API
```

### **4. Get user's chats:**
```javascript
GET /api/chats?page=1&limit=10
// Returns paginated list of user's chats
```

