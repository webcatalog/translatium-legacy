// set trial to expire in 24 hours;
if (!window.localStorage.getItem('trialExpires')) {
  const d = new Date();
  d.setHours(d.getHours() + 24);
  window.localStorage.setItem('trialExpires', d.toString());
}

const trialExpires = new Date(window.localStorage.getItem('trialExpires'));

const getTrialExpirationTime = () => trialExpires;

export default getTrialExpirationTime;
