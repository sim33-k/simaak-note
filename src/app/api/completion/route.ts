import { OpenAI } from "openai";

// /api/completion
const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HUGGINGFACE_API_KEY,
});

export async function POST(req: Request) {
  console.log('HF DeepSeek API route hit...');
  
  try {
    const { prompt } = await req.json();
    console.log('Received prompt:', prompt?.substring(0, 100) + '...');

    const stream = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3.1:fireworks-ai",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI embedded in a text editor that autocompletes sentences. 
          Provide natural, contextual completions that flow well with the existing text.
          Keep responses concise and relevant to the context.`,
        },
        {
          role: "user",
          content: `Complete this text naturally: "${prompt}"`,
        },
      ],
      stream: true,
      max_tokens: 100,
      temperature: 0.7,
    });

    console.log('HF DeepSeek stream created, setting up response...');

    // Create a ReadableStream for streaming response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let chunkCount = 0;
          for await (const chunk of stream) {
            chunkCount++;
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              console.log(`Streaming chunk ${chunkCount}:`, content);
              controller.enqueue(encoder.encode(content));
            }
          }
          console.log('Stream completed, total chunks:', chunkCount);
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
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
    console.error('HF DeepSeek API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}