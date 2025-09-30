import axios from 'axios';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Kalau pakai session cookie:
window.axios.defaults.withCredentials = true;
