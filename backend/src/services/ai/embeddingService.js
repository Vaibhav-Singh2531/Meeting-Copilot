import { Pinecone } from '@pinecone-database/pinecone';

let indexInstance = null;

export function initPinecone() {
  if (indexInstance) return indexInstance;

  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });

  indexInstance = pc.index(process.env.PINECONE_INDEX);
  return indexInstance;
}

export async function upsertMeetingEmbedding({ meetingId, roomCode, title, date, transcript }) {
  try {
    const index = initPinecone()

    await index.upsertRecords({
      records: [                    // ← wrap in { records: [...] }
        {
          id: meetingId,
          text: transcript,         // ← field name matches your index field map
          meetingId: meetingId,
          roomCode: roomCode,
          title: title,
          date: date
        }
      ]
    })

    console.log('Pinecone upsert successful for meeting:', meetingId)
  } catch (error) {
    console.error('Pinecone Upsert Error:', error)
  }
}

export async function searchSimilarMeetings(queryText, topK = 5) {
  try {
    const index = initPinecone()

    const results = await index.searchRecords({
      query: {
        inputs: { text: queryText },
        topK
      },
      fields: ['meetingId', 'roomCode', 'title', 'date']
    })

    return results.result?.hits || []
  } catch (error) {
    console.error('Pinecone Search Error:', error)
    return []
  }
}
