async function synthesize( text ) {
  const textToSpeech = require('@google-cloud/text-to-speech');
  const player = require('play-sound')();
  const fs = require('fs');
  const util = require('util');

  const client = new textToSpeech.TextToSpeechClient();

  const request = {
    input: {text: text},
    voice: {languageCode: 'es-US', name: 'es-US-Neural2-A', ssmlGender: 'FEMALE'},
    audioConfig: {audioEncoding: 'MP3'},
  };

  const [response] = await client.synthesizeSpeech(request);
  // Write the binary audio content to a local file
  const writeFile = util.promisify(fs.writeFile);
  await writeFile('output.mp3', response.audioContent, 'binary');
  player.play('./output.mp3', function(err){
  if (err) throw err;
  });
  // console.log('Audio content written to file: output.mp3');
}


module.exports = synthesize;