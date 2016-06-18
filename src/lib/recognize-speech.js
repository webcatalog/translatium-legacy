export const recognizeSpeech = (inputLang, inputAudio) => {
  const uri = `https://www.google.com/speech-api/v2/recognize?output=json&lang=${inputLang}`
          + '&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';
  const headers = { 'Content-Type': 'audio/l16; rate=16000' };

  return fetch(uri, { method: 'POST', body: inputAudio, headers })
    .then(result => {
      let { response } = result;
      if (response.length > 14) {
        response = response.substring(14, response.length);
        const outputText = JSON.parse(response).result[0].alternative[0].transcript;
        return { outputText };
      }
      return Promise.reject('Voice recognition failed');
    });
};
