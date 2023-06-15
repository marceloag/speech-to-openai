require("dotenv").config();

const API_KEY = process.env.API_KEY;
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const mic = require("mic");
const { Readable } = require("stream");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const synthesize = require('./tts.js');
const toText = require('./leopard.js');

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: API_KEY,
});
const openai = new OpenAIApi(configuration);
ffmpeg.setFfmpegPath(ffmpegPath);

// Record audio
function recordAudio(filename) {
  return new Promise((resolve, reject) => {
    const micInstance = mic({
      rate: "16000",
      channels: "1",
      fileType: "mp3",
    });

    const micInputStream = micInstance.getAudioStream();
    const output = fs.createWriteStream(filename);
    const writable = new Readable().wrap(micInputStream);

    console.log("Recording... Press Ctrl+C to stop.");

    writable.pipe(output);

    micInstance.start();

    process.on("SIGINT", () => {
      micInstance.stop();
      console.log("Finished recording");
      resolve();
    });

    micInputStream.on("error", (err) => {
      reject(err);
    });
  });
}

// Transcribe audio
async function transcribeAudio(filename) {
  const transcript = await openai.createTranscription(
    fs.createReadStream(filename),
    "whisper-1"
  );
  return transcript.data.text;
}

// Main function
async function main() {
  const audioFilename = "recorded_audio.wav";
  await recordAudio(audioFilename);
  const transcription = await transcribeAudio(audioFilename);
  const transcripcionLeopard = await toText(audioFilename);
  const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: transcription,
      max_tokens: 60,
  });
  console.log("Transcription:", transcription);
  console.log("Transcription Leopard:", transcripcionLeopard);
  console.log(completion.data.choices[0].text);
  synthesize(completion.data.choices[0].text);
}

main();