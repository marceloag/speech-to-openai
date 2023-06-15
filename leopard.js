require("dotenv").config();

async function toText(path){
  const fullPath = `./${path}`;
  const {Leopard} = require("@picovoice/leopard-node");
  const MODEL_PATH = "./leopard/leopard_model.pv";
  const ACCESS_KEY = process.env.LEOPARD_KEY;
  const accessKey = `${ACCESS_KEY}`; 

  console.log(fullPath);
  const handle = new Leopard(accessKey, { modelPath: `${MODEL_PATH}`});
  const { transcript, words } = handle.processFile(fullPath);
  console.log(transcript);
  return transcript;
}

// toText('output.mp3');

module.exports = toText;