const recognizeSpeech = (inputLang, inputAudio) => {
  const uri = `https://www.google.com/speech-api/v2/recognize?output=json&lang=${inputLang}`
          + '&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';
  const headers = { 'Content-Type': 'audio/l16; rate=16000' };

  return fetch(uri, { method: 'POST', body: inputAudio, headers })
    .then(res => res.text())
    .then(text => {
      if (text.length > 14) {
        const xmlStr = text.substring(14, text.length);
        const outputText = JSON.parse(xmlStr).result[0].alternative[0].transcript;
        return { outputText };
      }
      return Promise.reject(new Error('Voice recognition failed'));
    });
};

export default recognizeSpeech;
