/* global Windows */

const httpClient = new Windows.Web.Http.HttpClient();

// Add a user-agent header
const headers = httpClient.defaultRequestHeaders;
headers.userAgent
  .parseAdd('ie');
headers.userAgent
  .parseAdd('Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0)');

export default httpClient;
