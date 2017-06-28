/* global window */

const getPlatform = () => {
  if (window.Windows) {
    return 'windows';
  }

  return 'mac';
};

export default getPlatform;
