import sprite from 'svg-sprite-loader/runtime/sprite.build';

import createApp from './createApp';

// Render sprite
const spriteContent = sprite.stringify();

export default async function(context) {
  const { app, router, store } = createApp();
  const { url, authToken, apiUrl } = context;

  app.$axios.defaults.baseURL = `${apiUrl}/api/`;

  if (authToken) {
    app.$axios.defaults.headers = {
      'X-Auth-Token': authToken,
    };
    await store.dispatch('fetchCurrentUser');
  }

  router.push(url);

  return new Promise((resolve, reject) => {
    // wait until router has resolved possible async hooks
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents();
      // no matched routes
      if (!matchedComponents.length) {
        return reject({ code: 404 });
      }
      // Call fetchData hooks on components matched by the route.
      // A preFetch hook dispatches a store action and returns a Promise,
      // which is resolved when the action is complete and store state has been
      // updated.
      Promise.all(
        matchedComponents.map(({ asyncData }) => {
          if (asyncData) {
            return asyncData({
              store,
              route: router.currentRoute,
            });
          }
        })
      )
        .then(() => {
          // After all preFetch hooks are resolved, our store is now
          // filled with the state needed to render the app.
          // Expose the state on the render context, and let the request handler
          // inline the state in the HTML response. This allows the client-side
          // store to pick-up the server-side state without having to duplicate
          // the initial data fetching on the client.

          context.state = store.state;
          context.spriteContent = spriteContent;
          resolve(app);
        })
        .catch(reject);
    }, reject);
  });
}
