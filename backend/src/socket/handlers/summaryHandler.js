import { streamRollingSummary } from '../../services/ai/summaryService.js';

export default function summaryHandler(io, socket) {
  socket.on('request-summary', async ({ roomCode, transcript }) => {
    try {
      if (!transcript || transcript.trim().length === 0) {
        return;
      }

      await streamRollingSummary(transcript, (chunk) => {
        io.to(roomCode).emit('summary-chunk', { chunk });
      });

      io.to(roomCode).emit('summary-done');
    } catch (error) {
      console.error('Summary Generation Error:', error);
      io.to(roomCode).emit('summary-error', { error: error.message });
    }
  });
}
