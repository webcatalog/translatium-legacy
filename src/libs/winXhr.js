/* global Windows Blob */

const winXhr = ({ type, uri, responseType, data, headers }) => {
  const httpClient = new Windows.Web.Http.HttpClient();

  // Add a user-agent header
  const defaultHeaders = httpClient.defaultRequestHeaders;
  defaultHeaders.userAgent
    .parseAdd('ie');
  defaultHeaders.userAgent
    .parseAdd('Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0)');


  const httpUri = new Windows.Foundation.Uri(uri);

  const httpMethod = new Windows.Web.Http.HttpMethod(
    Windows.Web.Http.HttpMethod[type],
  );

  const request = new Windows.Web.Http.HttpRequestMessage(httpMethod, httpUri);

  Object.keys(headers || {}).forEach((k) => {
    request.headers.tryAppendWithoutValidation(k, headers[k]);
  });


  if (data) {
    request.content = data;
  }

  const promise = new Promise((resolve, reject) => {
    httpClient.sendRequestAsync(request)
      .then((response) => {
        try { response.ensureSuccessStatusCode(); } catch (err) { reject(err); }

        if (responseType === 'json') {
          return response.content.readAsStringAsync()
            .then(body => JSON.parse(body));
        }

        if (responseType === 'arraybuffer') {
          return response.content.readAsBufferAsync();
        }

        if (responseType === 'blob') {
          return response.content.readAsBufferAsync()
            .then((buffer) => {
              const reader = Windows.Storage.Streams.DataReader.fromBuffer(buffer);
              const bytes = new Uint8Array(buffer.length);
              reader.readBytes(bytes);
              const blob = new Blob([bytes], { type: 'audio/mpeg' });
              resolve(blob);
            });
        }

        return response.content.readAsStringAsync();
      })
      .done(
        (res) => { resolve(res); },
        (err) => { reject(err); },
      );
  });

  return promise;
};

export default winXhr;
