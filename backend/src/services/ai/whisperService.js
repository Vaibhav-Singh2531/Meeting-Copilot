import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function transcribeAudio(audioBuffer) {
  try {
    const result = await hf.automaticSpeechRecognition({
      model: 'openai/whisper-large-v3',
      data: audioBuffer,
    });
    
    return result.text;
  } catch (error) {
    console.error('Whisper Transcription Error:', error);
    throw new Error(`Failed to transcribe audio using HuggingFace: ${error.message}`);
  }
}
