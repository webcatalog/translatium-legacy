const recognizeHandwriting = (inputLang, inputInk, canvasHeight, canvasWidth) => {
  const uri = 'https://www.google.com/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8';
  const device = 'Mozilla/5.0 (Linux; Android 4.0.4; GT-i9100 Build/IML74K) '
               + 'AppleWebKit/537.31 (KHTML, like Gecko) '
               + 'Chrome/26.0.1410.49 Mobile Safari/537.31 ApiKey/1.257';
  const data = {
    device,
    options: 'enable_pre_space',
    requests: [
      {
        writing_guide: {
          writing_area_width: canvasWidth,
          writing_area_height: canvasHeight,
        },
        ink: inputInk,
        language: inputLang,
      },
    ],
  };
  const headers = { 'Content-Type': 'application/json' };
  return fetch(uri, { method: 'POST', body: JSON.stringify(data), headers })
    .then(res => res.json())
    .then(json => json[1][0][1])
    .then(outputArr => ({ outputArr }));
};

export default recognizeHandwriting;
