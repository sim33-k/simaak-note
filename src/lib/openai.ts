import { Configuration, OpenAIApi } from "openai-edge"
import OpenAI from "openai"

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(config)
const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

// to enhance the the prompt given to generateImage
export async function generateImagePrompt(name: string) {
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {role: "system", content: "You are a helpful assistant that generates image prompts for a note-taking app. Youre tasked with creating thumbnail descriptions for my notes. Your output will be fed into DALLE API to generate a thumbnail. The description should be minimalistic, flat styled, and safe for all audiences. Avoid any potentially controversial or inappropriate content. Focus on simple, clean visual elements."},
                {role: "user", content: `Generate a simple, safe thumbnail description for the note: ${name}. Keep it under 100 characters and focus on visual elements only.`}
            ]
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json()
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response structure from OpenAI API');
        }
        
        const image_description = data.choices[0].message.content
        console.log({image_description})
        return image_description as string
    } catch (error) {
        console.error('Error generating image prompt:', error);
        // Return a fallback description if the API fails
        return `A minimalist flat style icon representing ${name}`;
    }
}

export async function generateImage(image_description: string) {
    try {
        // Clean and validate the prompt
        const cleanPrompt = image_description
            .replace(/[^\w\s\-.,]/g, '') // Remove special characters that might cause issues
            .trim()
            .substring(0, 100); // Limit to 100 characters
        
        if (!cleanPrompt) {
            throw new Error('Invalid prompt after cleaning');
        }

        const response = await openaiClient.images.generate({
            model: "dall-e-2",
            prompt: cleanPrompt,
            size: "256x256",
        })

        if (!response.data || !response.data[0] || !response.data[0].url) {
            throw new Error('Invalid response structure from DALL-E API');
        }

        const image_url = response.data[0].url
        return image_url as string
    } catch (error: any) {
        console.error('Error generating image:', error);
        
        // Check if it's a billing limit error
        if (error.code === 'billing_hard_limit_reached' || error.status === 400) {
            console.log('Billing limit reached, using fallback placeholder image');
            // Use Picsum Photos for random placeholder images
            const randomId = Math.floor(Math.random() * 1000);
            return `https://picsum.photos/256/256?random=${randomId}`;
        }
        
        return null;
    }
}