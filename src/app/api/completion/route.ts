// /api/completion
export async function POST(req: Request) {
    console.log('Gemini API route hit...');
    
    try {
      const { prompt } = await req.json();
      console.log('Received prompt:', prompt?.substring(0, 100) + '...');
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Complete this text naturally and concisely. Only provide the continuation, nothing else:
  
  "${prompt}"`
            }]
          }],
          generationConfig: {
            maxOutputTokens: 100,
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });
  
      console.log('Gemini response status:', response.status);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }
  
      const data = await response.json();
      console.log('Gemini raw response:', JSON.stringify(data, null, 2));
      
      const completion = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!completion) {
        console.error('No completion in response:', data);
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