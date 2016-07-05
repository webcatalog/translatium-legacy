/* global Windows */

import httpClient from './httpClient';

const fetchRequest = (uriString, stream) => {
  const uri = new Windows.Foundation.Uri(uriString);

  const httpMethod = new Windows.Web.Http.HttpMethod(
    Windows.Web.Http.HttpMethod.post
  );

  const request = new Windows.Web.Http.HttpRequestMessage(httpMethod, uri);

  const streamContent = new Windows.Web.Http.HttpStreamContent(stream);
  streamContent.headers.append(
    'Context-Type',
    new Windows.Web.Http.Headers.HttpMediaTypeWithQualityHeaderValue('audio/l16; rate=16000')
  );

  request.data = streamContent;

  const promise = new Promise((resolve, reject) => {
    httpClient.sendRequestAsync(request)
      .then(response => {
        try { response.ensureSuccessStatusCode(); } catch (err) { reject(err); }
        return response.content.readAsStringAsync();
      })
      .done(
        body => { resolve(body); },
        err => { reject(err); }
      );
  });

  return promise;
};

const recognizeSpeech = (inputLang, inputAudio) => {
  const uri = `https://www.google.com/speech-api/v2/recognize?output=json&lang=${inputLang}`
          + '&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';

  return fetchRequest(uri, inputAudio)
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
