"use client";

import { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import { initFirebase } from "@/lib/googleAuth";

// Initialize Firebase
initFirebase();

interface Message {
  _id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface GuessGame {
  _id: string;
  messages: Message[];
  metadata: {
    questionCount: number;
    gameState: "questioning" | "guessing" | "completed";
    gameResult?: string;
  };
}

export default function CharacterGuessGame() {
  const [game, setGame] = useState<GuessGame | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [game?.messages]);

  const startNewGame = async () => {
    setIsStarting(true);
    setError(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Authentication required");
      }

      const token = await user.getIdToken();

      // Create chat using the same endpoint as character chat
      const response = await fetch(`http://localhost:5001/api/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            character: {
              name: "Character Guesser",
              bookTitle: "Guessing Game",
              description: "AI that tries to guess the book character you're thinking of",
              avatar: "🔮",
            },
            context: "character_guessing_game",
            model: "gemini-pro"
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start new game");
      }

      const data = await response.json();
      const chat = data.data.chat;

      // Now call Gemini API directly (like character chat does)
      await generateInitialQuestion(chat._id, token);

    } catch (err) {
      console.error("Error starting game:", err);
      setError(err instanceof Error ? err.message : "Failed to start game");
    } finally {
      setIsStarting(false);
    }
  };

  const generateInitialQuestion = async (chatId: string, token: string) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not found");
      }

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const systemPrompt = `You are playing a character guessing game like Akinator, but specifically for book characters. Your goal is to guess the literary character the user has in mind by asking strategic questions that can only be answered with "YES", "NO", or "NOT SURE".

Rules:
1. Ask short, focused questions that help narrow down the possibilities
2. Start with broad categories (genre, time period, gender, etc.) and get more specific
3. Questions should be answerable with only YES, NO, or NOT SURE
4. When you're confident (after gathering enough information), make your guess in the format: "GUESS: [Character Name] from [Book Title] by [Author]"
5. Keep track of all previous answers to avoid contradictions

Start by asking your first question to begin narrowing down the character.`;

      const result = await model.generateContent(systemPrompt);
      const aiResponse = result.response.text();

      // Add AI's first question to the chat (same as character chat)
      const messageResponse = await fetch(`http://localhost:5001/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            role: "assistant",
            content: aiResponse,
          },
        }),
      });

      if (!messageResponse.ok) {
        throw new Error("Failed to save AI message");
      }

      const updatedChat = await messageResponse.json();
      setGame(updatedChat.data.chat);

    } catch (error) {
      console.error("Error generating initial question:", error);
      setError("Failed to generate initial question");
    }
  };

  const respondToQuestion = async (response: "YES" | "NO" | "NOT SURE") => {
    if (!game) return;

    setIsLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Authentication required");
      }

      const token = await user.getIdToken();

      // First, add user's response to chat (same as character chat)
      const userMessageResponse = await fetch(`http://localhost:5001/api/chats/${game._id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            role: "user",
            content: response,
          },
        }),
      });

      if (!userMessageResponse.ok) {
        throw new Error("Failed to save user response");
      }

      const userMessageData = await userMessageResponse.json();

      // Then call Gemini API for AI response
      await generateAIResponse(game._id, token, userMessageData.data.chat.messages);

    } catch (err) {
      console.error("Error sending response:", err);
      setError(err instanceof Error ? err.message : "Failed to send response");
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (chatId: string, token: string, messages: Message[]) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not found");
      }

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const systemContext = `You are playing a character guessing game like Akinator, but specifically for book characters. Your goal is to guess the literary character the user has in mind by asking strategic questions that can only be answered with "YES", "NO", or "NOT SURE".

Rules:
1. Ask short, focused questions that help narrow down the possibilities
2. Start with broad categories (genre, time period, gender, etc.) and get more specific
3. Questions should be answerable with only YES, NO, or NOT SURE
4. When you're confident (after gathering enough information), make your guess in the format: "GUESS: [Character Name] from [Book Title] by [Author]"
5. Keep track of all previous answers to avoid contradictions
6. If the user says your guess is wrong, continue questioning with new strategies

Previous conversation:
${messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Continue the guessing game. If you haven't made a guess yet and feel you have enough information, make your guess. If you already made a guess and the user said NO, ask a different type of question to find the character.`;

      const result = await model.generateContent(systemContext);
      const aiResponse = result.response.text();

      // Add AI's response to the chat
      const aiMessageResponse = await fetch(`http://localhost:5001/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            role: "assistant",
            content: aiResponse,
          },
        }),
      });

      if (!aiMessageResponse.ok) {
        throw new Error("Failed to save AI response");
      }

      const updatedChat = await aiMessageResponse.json();
      setGame(updatedChat.data.chat);

      // Check if AI made a guess
      if (aiResponse.includes("GUESS:")) {
        setShowConfirmation(true);
      }

    } catch (error) {
      console.error("Error generating AI response:", error);
      setError("Failed to generate AI response");
    }
  };

  const confirmGuess = async (isCorrect: boolean) => {
    if (!game) return;

    setIsLoading(true);
    setError(null);
    setShowConfirmation(false);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Authentication required");
      }

      const token = await user.getIdToken();

      let finalMessage: string;
      if (isCorrect) {
        const questionCount = game.messages.filter(msg => msg.role === "assistant" && !msg.content.includes("GUESS:")).length;
        finalMessage = `🎉 Excellent! I guessed your character correctly in ${questionCount} questions! Thanks for playing!`;
      } else {
        finalMessage = "That's not correct! Let me ask more questions to find the right character.";
      }

      // Add final message to chat
      const messageResponse = await fetch(`http://localhost:5001/api/chats/${game._id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            role: "assistant",
            content: finalMessage,
          },
        }),
      });

      if (!messageResponse.ok) {
        throw new Error("Failed to save final message");
      }

      const updatedChat = await messageResponse.json();
      setGame(updatedChat.data.chat);

    } catch (err) {
      console.error("Error confirming guess:", err);
      setError(err instanceof Error ? err.message : "Failed to confirm guess");
    } finally {
      setIsLoading(false);
    }
  };

  const isGameCompleted = game?.metadata.gameState === "completed";
  const lastMessage = game?.messages[game.messages.length - 1];
  const isAIGuess = lastMessage?.content.includes("GUESS:");

  if (!game) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔮</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Ready to Play?
          </h2>
          <p className="text-gray-600 mb-6">
            Think of any book character and I&apos;ll try to guess who it is!
            I&apos;ll ask you questions that you can answer with just &quot;Yes&quot;, &quot;No&quot;, or &quot;Not Sure&quot;.
          </p>
          <button
            onClick={startNewGame}
            disabled={isStarting}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isStarting ? "Starting Game..." : "Start New Game"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Game Header */}
      <div className="bg-purple-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Character Guesser 🔮</h2>
          <div className="text-sm">
            Questions: {game.metadata.questionCount || 0}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {game.messages.map((message, index) => (
          <div
            key={message._id || index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Response Buttons */}
      {!isGameCompleted && !isLoading && !showConfirmation && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex space-x-2 justify-center">
            <button
              onClick={() => respondToQuestion("YES")}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => respondToQuestion("NO")}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              No
            </button>
            <button
              onClick={() => respondToQuestion("NOT SURE")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Not Sure
            </button>
          </div>
        </div>
      )}

      {/* Guess Confirmation */}
      {showConfirmation && isAIGuess && (
        <div className="p-4 border-t bg-blue-50">
          <p className="text-center text-gray-700 mb-4">
            Is my guess correct?
          </p>
          <div className="flex space-x-2 justify-center">
            <button
              onClick={() => confirmGuess(true)}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Yes, Correct!
            </button>
            <button
              onClick={() => confirmGuess(false)}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              No, Wrong
            </button>
          </div>
        </div>
      )}

      {/* Game Completed */}
      {isGameCompleted && (
        <div className="p-4 border-t bg-green-50">
          <div className="text-center">
            <p className="text-green-700 font-semibold mb-4">
              🎉 Game Complete!
            </p>
            <button
              onClick={startNewGame}
              disabled={isStarting}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isStarting ? "Starting..." : "Play Again"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
