import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

export async function streamRollingSummary(transcript, onChunk) {
  try {
    const prompt = `You are a meeting assistant. Summarise only this portion of the meeting transcript in 3-5 sentences. Focus only on what was discussed in this specific segment, not the entire meeting. Be concise and clear. Transcript segment: ${transcript}`;
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

export async function extractActionItems(fullTranscript) {
  try {
    const prompt = `You are a meeting assistant. Extract all action items from this meeting transcript. Return ONLY a valid JSON array with no markdown, no backticks, no explanation. Each item must have these fields: title (string), assigneeName (string or null if not mentioned), priority (one of: LOW, MEDIUM, HIGH, URGENT), dueDate (null). Transcript: ${fullTranscript}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Strip markdown formatting if the model incorrectly returns it
    if (text.startsWith('```json')) {
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/```/g, '').trim();
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Action Items Extraction Error:', error);
    return [];
  }
}
