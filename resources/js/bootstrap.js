import axios from 'axios';

window.axios = axios;

axios.defaults.withCredentials = true;

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

const metaToken = document.querySelector('meta[name="csrf-token"]')?.content;
if (metaToken) {
  axios.interceptors.request.use((config) => {
    if (!config.headers['X-CSRF-TOKEN'] && !config.headers['X-XSRF-TOKEN']) {
      config.headers['X-CSRF-TOKEN'] = metaToken;
    }
    return config;
  });
}
