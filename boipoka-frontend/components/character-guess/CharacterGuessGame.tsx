"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function CharacterGuessGame() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest"
    });
  };

  useEffect(() => {
    // Only scroll if there are messages and we're not in the middle of loading
    if (messages.length > 0) {
      // Use a small delay to ensure the DOM has updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const startNewGame = async () => {
    setIsStarting(true);
    setError(null);
    setMessages([]);
    setQuestionCount(0);

    try {
      await generateInitialQuestion();
      setGameStarted(true);
    } catch (err) {
      console.error("Error starting game:", err);
      setError(err instanceof Error ? err.message : "Failed to start game");
    } finally {
      setIsStarting(false);
    }
  };

  const generateInitialQuestion = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not found");
      }

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const systemPrompt = `You are playing a character guessing game. Your goal is to guess the literary character the user has in mind by asking strategic elimination questions.

RULES:
1. Ask ONE short, simple question that can ONLY be answered with YES, NO, or NOT SURE
2. Each question should eliminate roughly half of all possible book characters
3. Start with broad categories: gender, time period, genre, age group, etc.
4. Keep questions under 10 words
5. When confident after 8-12 questions, make your guess as: "GUESS: [Character Name] from [Book Title]"

Ask your first elimination question now:`;

      const result = await model.generateContent(systemPrompt);
      const aiResponse = result.response.text();

      const aiMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages([aiMessage]);
      setQuestionCount(1);

    } catch (error) {
      console.error("Error generating initial question:", error);
      throw new Error("Failed to generate initial question");
    }
  };

  const respondToQuestion = async (response: "YES" | "NO" | "NOT SURE") => {
    if (!gameStarted) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add user's response
      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: response,
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Generate AI response
      await generateAIResponse(updatedMessages);

    } catch (err) {
      console.error("Error sending response:", err);
      setError(err instanceof Error ? err.message : "Failed to send response");
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (currentMessages: Message[]) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not found");
      }

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Extract previous Q&A pairs for context
      const conversation = currentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

      const systemContext = `You are playing a character elimination game. Your goal is to guess the literary character using strategic elimination questions.

RULES:
1. Ask ONE short elimination question (under 10 words)
2. Each question should eliminate roughly half of remaining possibilities
3. NEVER repeat information the user already provided
4. NEVER ask questions that contradict previous answers
5. Progress from broad to specific: genre → time period → characteristics → specific traits
6. After 8-12 strategic questions, make your guess as: "GUESS: [Character Name] from [Book Title]"

Previous Q&A:
${conversation}

Based on the answers above, ask your next elimination question (or make your guess if ready):`;

      const result = await model.generateContent(systemContext);
      const aiResponse = result.response.text();

      const aiMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages([...currentMessages, aiMessage]);

      // Check if AI made a guess
      if (aiResponse.includes("GUESS:")) {
        setShowConfirmation(true);
      } else {
        setQuestionCount(prev => prev + 1);
      }

    } catch (error) {
      console.error("Error generating AI response:", error);
      setError("Failed to generate AI response");
    }
  };

  const confirmGuess = async (isCorrect: boolean) => {
    setIsLoading(true);
    setError(null);
    setShowConfirmation(false);

    try {
      let finalMessage: string;
      if (isCorrect) {
        finalMessage = `🎉 Excellent! I guessed your character correctly in ${questionCount} questions! Thanks for playing!`;
      } else {
        finalMessage = "That's not correct! Let me ask more questions to find the right character.";
      }

      const finalAiMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: finalMessage,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, finalAiMessage]);

      if (!isCorrect) {
        setQuestionCount(prev => prev + 1);
      }

    } catch (err) {
      console.error("Error confirming guess:", err);
      setError(err instanceof Error ? err.message : "Failed to confirm guess");
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    setMessages([]);
    setGameStarted(false);
    setQuestionCount(0);
    setShowConfirmation(false);
    setError(null);
  };

  const lastMessage = messages[messages.length - 1];
  const isAIGuess = lastMessage?.content.includes("GUESS:");
  const isGameCompleted = lastMessage?.content.includes("🎉");

  if (!gameStarted) {
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
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              Questions: {questionCount}
            </div>
            <button
              onClick={resetGame}
              className="text-sm bg-purple-700 hover:bg-purple-800 px-3 py-1 rounded"
            >
              New Game
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
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
              Game Complete!
            </p>
            <button
              onClick={resetGame}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}