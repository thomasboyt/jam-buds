import Vue from 'vue';
import axios from 'axios';

/**
 * Strategy stolen from nuxt.js.
 *
 * Basically:
 *
 * 1. Pass $axios instance into root App instance and Veux store
 * 2. Create Vue.prototype property that will act as a getter for this instance
 */
export default function injectAxios(appConfig) {
  // Don't bother proxying through ourself!
  const baseHost = process.env.VUE_ENV === 'server' ? process.env.API_URL : '';

  const apiClient = axios.create({
    baseURL: `${baseHost}/api/`,
  });

  appConfig.$axios = apiClient;
  appConfig.store.$axios = apiClient;

  Vue.use(() => {
    if (!Vue.prototype.hasOwnProperty('$axios')) {
      Object.defineProperty(Vue.prototype, '$axios', {
        get() {
          return this.$root.$options['$axios'];
        },
      });
    }
  });
}
