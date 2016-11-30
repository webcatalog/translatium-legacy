/* global Response XMLHttpRequest */

const fetchLocal = url =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      resolve(new Response(xhr.responseText, { status: xhr.status }));
    };
    xhr.onerror = () => {
      reject(new TypeError('Local request failed'));
    };
    xhr.open('GET', url);
    xhr.send(null);
  });

export default fetchLocal;
