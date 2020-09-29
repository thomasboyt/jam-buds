/**
 * the current displayed color scheme is managed here, instead of in a
 * component, for a few reasons:
 *
 * - <main-wrapper> gets destroyed between page views, so it can't manage the
 *   "last color scheme" state
 * - needed a way to set color scheme pre-navigation in some cases
 */
const colorScheme = {
  namespaced: true,

  state() {
    return {
      override: null,
      lastColorScheme: null,
      shouldOverride: false,
    };
  },

  mutations: {
    setColorSchemeOverride(state, override) {
      state.override = override;
      state.lastColorScheme = override;
    },
    enableOverride(state) {
      state.shouldOverride = true;
      state.override = null;
    },
    disableOverride(state) {
      state.shouldOverride = false;
      state.override = null;
      state.lastColorScheme = null;
    },
  },

  actions: {
    setOverrideFromProfile(context, profileName) {
      context.commit(
        'setColorSchemeOverride',
        context.rootState.profiles[profileName].colorScheme
      );
    },
  },

  getters: {
    currentUserColorScheme(state, getters, rootState) {
      return rootState.profiles[rootState.currentUser.name]?.colorScheme;
    },
    currentColorScheme(state, getters) {
      if (state.shouldOverride) {
        // if we expect an override, but none is present, render the last color scheme
        if (!state.override) {
          return state.lastColorScheme || getters.currentUserColorScheme;
        }
        return state.override;
      }
      return getters.currentUserColorScheme;
    },
  },
};

export default colorScheme;
