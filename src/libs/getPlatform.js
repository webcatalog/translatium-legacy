/* global window */

const getPlatform = () => {
  if (window.Windows) {
    return 'windows';
  }

  if (window.cordova) {
    return 'cordova';
  }

  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return 'mac';
  }

  return 'browser';
};

export default getPlatform;
