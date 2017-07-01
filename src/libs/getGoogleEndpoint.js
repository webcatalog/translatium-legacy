const getGoogleEndpoint = (chinaMode) => {
  let endpoint = 'https://translate.google.com';
  if (chinaMode) {
    endpoint = 'http://translate.google.cn';
  }
  if (process.env.NODE_ENV === 'development') {
    endpoint = 'http://localhost:3000';
  }

  return endpoint;
};

export default getGoogleEndpoint;
