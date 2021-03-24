export default function({ $axios, store }) {
  if (process.client) {
    const authToken = store.state.auth.authToken;

    if (authToken) {
      $axios.defaults.headers = {
        'X-Auth-Token': authToken,
      };
    }
  }

  // Prevent unhandled Axios errors in SSR from throwing an error when
  // serialized
  $axios.onError((error) => {
    // only need to fix during SSR
    if (process.server) {
      // request errors do not seem to have this issue
      if (error.response) {
        // construct a new error object in the same form as the Axios error.
        // this is a simplified subset of the Axios error object that I need
        // for my app, but if this was implemented in this library, it would
        // contain the rest of err.response that can be serialized (e.g.
        // headers, statusText, etc.)
        const err = new Error(
          `Request failed with status code ${error.response.status}`
        );
        err.response = {
          data: error.response.data,
          status: error.response.status,
        };
        err.isAxiosError = true;
        return Promise.reject(err);
      }
    }
  });
}
