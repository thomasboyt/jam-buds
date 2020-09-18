/**
 * This plugin adds a router hook for tracking whether or not a user is on the
 * "entry page" of the app (e.g. they clicked on), or if they're on a page
 * they've navigated to inside the app.
 *
 * This "fromApp" boolean is stored on the history location state. vue-router
 * does not expose the state field, unlike react-router, so we have to manually
 * replace state to add this field after navigation.
 */
export default function attachFromState({ app }) {
  app.router.afterEach((to, from) => {
    if (process.client) {
      if (history.state.fromApp !== undefined) {
        // don't overwrite state if it's already present (popped state)
        return;
      }
      if (from.name !== null) {
        history.replaceState({ ...history.state, fromApp: true }, '');
      } else {
        history.replaceState({ ...history.state, fromApp: false }, '');
      }
    }
  });
}
