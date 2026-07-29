import { AssemblyAI } from 'assemblyai'

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY })

export function createRealtimeTranscriber(onTranscript, onError) {
  // client.streaming replaces client.realtime
  // speechModel is now required — omitting causes 404
  const transcriber = client.streaming.transcriber({
    speechModel: 'u3-rt-pro',
    sampleRate: 16000,
    connectTimeout: 10000,      // ← increase to 10 seconds
    maxConnectionRetries: 3,     // ← retry up to 3 times
    formatTurns: true
  })

  transcriber.on('open', ({ id }) => {
    console.log('AssemblyAI session opened:', id)
  })

  // 'turn' replaces 'transcript'
  transcriber.on('turn', (turn) => {
    console.log('Turn received:', JSON.stringify(turn))
    // if (turn.transcript && turn.end_of_turn) {
    //   onTranscript(turn.transcript)
    // }
    if (turn.transcript) {
      onTranscript(turn.transcript, turn.end_of_turn, turn.turn_order)
    }
  })

  transcriber.on('error', (error) => {
    console.error('AssemblyAI error:', error)
    onError(error)
  })

  transcriber.on('close', (code, reason) => {
    console.log('AssemblyAI session closed:', code, reason)
  })

  return transcriber
}