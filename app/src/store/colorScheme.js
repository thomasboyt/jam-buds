import { defaultColorScheme } from '~/util/gradients';

/**
 * the current displayed color scheme is managed here, instead of in a
 * component, for a few reasons:
 *
 * - <main-wrapper> gets destroyed between page views, so it can't manage the
 *   "last color scheme" state
 * - needed a way to set color scheme pre-navigation in some cases
 */
export const state = () => {
  return {
    override: null,
    lastColorScheme: null,
    shouldOverride: false,
  };
};

export const mutations = {
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
};

export const actions = {
  setOverrideFromProfile(context, profileName) {
    context.commit(
      'setColorSchemeOverride',
      context.rootState.profiles[profileName].colorScheme
    );
  },
};

export const getters = {
  currentUserColorScheme(state, getters, rootState) {
    return rootState.profiles[rootState.currentUser.name]?.colorScheme;
  },
  currentColorScheme(state, getters) {
    if (state.shouldOverride) {
      // if we expect an override, but none is present, render the last color scheme
      if (!state.override) {
        return (
          state.lastColorScheme ||
          getters.currentUserColorScheme ||
          defaultColorScheme
        );
      }
      return state.override;
    }
    return getters.currentUserColorScheme || defaultColorScheme;
  },
};
