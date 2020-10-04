/**
 * Returns whether the current page in route is the current root route (as
 * determined by the current bottom tab).
 */
export default function isRootPage(store, route) {
  const activeBottomTab = store.state.activeBottomTab;
  if (route.path === activeBottomTab) {
    return true;
  }

  // hack for profile page...
  if (
    activeBottomTab.startsWith('/users') &&
    route.path.startsWith(activeBottomTab)
  ) {
    return true;
  }

  return false;
}
