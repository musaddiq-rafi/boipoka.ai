import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
      const body = await request.json();
      const { messages, context, characterName } = body;

      const conversationHistory = messages
          .slice(-10)
          .map((msg: { role: string; content: string }) =>
              `${msg.role === 'user' ? 'Human' : characterName}: ${msg.content}`
          ).join('\n');

      const systemPrompt = `${context}

Current Conversation:
${conversationHistory}

You are ${characterName}. Stay completely in character at all times. Use the personality, speech patterns, vocabulary, and mannerisms that are authentic to this character. Respond as if you are actually this character having a real conversation.

Character Guidelines:
- Maintain the character's unique voice and perspective
- Use appropriate language and vocabulary for the character
- Reference their world, experiences, and knowledge when relevant
- Show their personality traits through your responses
- Stay consistent with their established character arc and development

Current Conversation:
${conversationHistory}

Respond as ${characterName} would respond:`;

    // Call your AI service (example with Gemini)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt }]
        }],
        generationConfig: {
          temperature: 0.8,  // Higher temperature for more character personality
          maxOutputTokens: 500,
          topK: 40,
          topP: 0.95,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const result = await response.json();
    const aiContent = result.candidates[0].content.parts[0].text;

    return NextResponse.json({
      success: true,
      data: {
        content: aiContent
      }
    });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}