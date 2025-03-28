import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeImage(imageUrl: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Please analyze this shopping receipt or image of items and return a JSON array of items with their quantities and units. Format: [{name: string, quantity: number, unit: string, category: string}]" },
          {
            type: "image_url",
            image_url: imageUrl,
          },
        ],
      },
    ],
    max_tokens: 1000,
  });

  try {
    const content = response.choices[0].message.content;
    if (!content) throw new Error('No content in response');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw new Error('Failed to parse items from image');
  }
} 