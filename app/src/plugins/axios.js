export default function ({ $axios, store }) {
  if (process.client) {
    const authToken = store.state.auth.authToken;

    if (authToken) {
      $axios.defaults.headers = {
        'X-Auth-Token': authToken,
      };
    }
  }

  // TODO: Add a nice request log somehow
  // $axios.onRequest((config) => {
  //   console.log('Making request to ' + config.url);
  // });
}
