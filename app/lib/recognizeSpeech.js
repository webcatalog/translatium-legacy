/* global Windows */

import winXhr from './winXhr';

const recognizeSpeech = (inputLang, inputAudio) => {
  const uri = `https://www.google.com/speech-api/v2/recognize?output=json&lang=${inputLang}`
          + '&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';

  const data = new Windows.Web.Http.HttpStreamContent(inputAudio.getInputStreamAt(0));
  data.headers.contentType =
    new Windows.Web.Http.Headers.HttpMediaTypeHeaderValue('audio/l16; rate=16000');

  return winXhr({
    type: 'post',
    uri,
    responseType: 'text',
    data,
  })
  .then(text => {
    if (text.length > 14) {
      const xmlStr = text.substring(14, text.length);
      const outputText = JSON.parse(xmlStr).result[0].alternative[0].transcript;
      return { outputText };
    }
    return { outputText: '' };
  });
};

export default recognizeSpeech;
