import { searchSimilarMeetings } from '../ai/embeddingService.js';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { GoogleGenerativeAI } from '@google/generative-ai';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

export const searchMeetings = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Query string q is required.' });
    }

    const searchResults = await searchSimilarMeetings(q, 5);
    
    // Pinecone Integrated Embeddings searchRecords returns an object containing an array of matched records
    const matches = Array.isArray(searchResults) ? searchResults : (searchResults.records || searchResults.matches || []);
    
    if (!matches || matches.length === 0) {
      return res.json({ answer: 'No relevant meetings found.', meetings: [] });
    }

    // Attempt to parse ID out of whichever SDK version format was returned
    const meetingIds = matches.map(m => m.id || (m.fields && m.fields.meetingId) || (m.metadata && m.metadata.meetingId));

    if (meetingIds.length === 0) {
      return res.json({ answer: 'No relevant meetings found.', meetings: [] });
    }

    const fetchedMeetings = await prisma.meeting.findMany({
      where: { id: { in: meetingIds } },
      select: { id: true, title: true, roomCode: true, createdAt: true, finalSummary: true }
    });

    let context = '';
    for (const meeting of fetchedMeetings) {
      if (meeting.finalSummary) {
        context += `Meeting: ${meeting.title} (${meeting.createdAt.toISOString()})\nSummary: ${meeting.finalSummary}\n---\n`;
      }
    }
    
    if (!context) {
       return res.json({ answer: 'Relevant meetings were found, but none of them have finished generating their summaries yet.', meetings: fetchedMeetings });
    }

    const prompt = `You are a meeting assistant with access to past meeting summaries. Answer this question based only on the provided meeting context. Be specific and mention which meeting the information comes from. Question: ${q}. Meeting context: ${context}`;

    const geminiResult = await model.generateContent(prompt);
    const answer = geminiResult.response.text();

    res.json({ answer, meetings: fetchedMeetings });
  } catch (error) {
    console.error('Search Controller Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
