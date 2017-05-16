import translateText from './translateText';

const translateArray = (inputLang, outputLang, inputArr, chinaMode) =>
  Promise.resolve()
    .then(() => {
      const inputText = inputArr.join('\n');
      return translateText(inputLang, outputLang, inputText, chinaMode);
    })
    .then(({ outputText }) => ({
      outputText,
      outputArr: outputText.split('\n'),
    }));

export default translateArray;
