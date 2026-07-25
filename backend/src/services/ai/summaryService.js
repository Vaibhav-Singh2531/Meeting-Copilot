import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function streamRollingSummary(transcript, onChunk) {
  try {
    const prompt = `You are a meeting assistant. Based on the following transcript, write a concise 3-5 sentence summary of what has been discussed so far. Focus on key points and decisions. Transcript: ${transcript}`;

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        onChunk(chunkText);
      }
    }
  } catch (error) {
    console.error('Rolling Summary Error:', error);
  }
}

export async function generateFinalSummary(fullTranscript) {
  try {
    const prompt = `You are a meeting assistant. Analyze this complete meeting transcript and provide a structured summary with these sections: Overview (2-3 sentences), Key Decisions (bullet points), Open Questions (bullet points), Next Steps (bullet points with assignee if mentioned). Transcript: ${fullTranscript}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Final Summary Error:', error);
    throw new Error(`Failed to generate final summary using Gemini: ${error.message}`);
  }
}
