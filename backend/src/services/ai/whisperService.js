import { HfInference } from '@huggingface/inference'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import fs from 'fs'
import path from 'path'
import os from 'os'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

const convertToWav = (inputBuffer) => {
  return new Promise((resolve, reject) => {
    const tmpDir = os.tmpdir()
    const inputPath = path.join(tmpDir, `input_${Date.now()}.webm`)
    const outputPath = path.join(tmpDir, `output_${Date.now()}.wav`)

    // Write input buffer to temp file
    fs.writeFileSync(inputPath, inputBuffer)

    ffmpeg(inputPath)
      .audioFrequency(16000)
      .audioChannels(1)
      .toFormat('wav')
      .on('error', (err) => {
        fs.unlinkSync(inputPath)
        reject(err)
      })
      .on('end', () => {
        const wavBuffer = fs.readFileSync(outputPath)
        // Cleanup temp files
        fs.unlinkSync(inputPath)
        fs.unlinkSync(outputPath)
        resolve(wavBuffer)
      })
      .save(outputPath)
  })
}

export async function transcribeAudio(audioBuffer) {
  try {
    const wavBuffer = await convertToWav(audioBuffer)

    if (wavBuffer.length === 0) {
      throw new Error('WAV conversion produced empty buffer')
    }

    const blob = new Blob([wavBuffer], { type: 'audio/wav' })

    const result = await hf.automaticSpeechRecognition({
      model: 'openai/whisper-large-v3',
      data: blob,
      provider: 'hf-inference'
    })
    return result.text || ''
  } catch (error) {
    console.error('Whisper Transcription Error:', error)
    throw new Error(`Failed to transcribe: ${error.message}`)
  }
}