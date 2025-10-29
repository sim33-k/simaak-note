import { GoogleGenAI } from "@google/genai";

// /api/completion
export async function POST(req: Request) {
  console.log('Gemini API route hit...');

  try {
    const { prompt } = await req.json();
    console.log('Received prompt:', prompt?.substring(0, 100) + '...');

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: `Complete this text naturally and concisely. Only provide the continuation, nothing else:\n\n"${prompt}"`,
      config: {
        maxOutputTokens: 100,
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });

    const completion = response.text || '';

    if (!completion) {
      console.error('No completion in response');
      throw new Error('No completion generated');
    }

    console.log('Generated completion:', completion);

    // Create a streaming response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      start(controller) {
        let charIndex = 0;

        const sendNextChar = () => {
          if (charIndex < completion.length) {
            const char = completion[charIndex];
            controller.enqueue(encoder.encode(char));
            charIndex++;

            // Variable typing speed for realistic effect
            let delay = 40;
            if (char === ' ') delay = 20;
            else if (char === '.' || char === ',' || char === ';') delay = 80;

            setTimeout(sendNextChar, delay);
          } else {
            controller.close();
          }
        };

        // Small initial delay to simulate "thinking"
        setTimeout(sendNextChar, 100);
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}