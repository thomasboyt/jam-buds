import { getterTree, mutationTree, actionTree } from 'typed-vuex';
import { defaultColorScheme } from '~/util/gradients';
import { ApiSchema } from '~/api/_helpers';

type ColorScheme = ApiSchema<'ColorScheme'>;

interface ColorSchemeState {
  override: ColorScheme | null;
  lastColorScheme: ColorScheme | null;
  shouldOverride: boolean;
}

/**
 * the current displayed color scheme is managed here, instead of in a
 * component, for a few reasons:
 *
 * - <main-wrapper> gets destroyed between page views, so it can't manage the
 *   "last color scheme" state
 * - needed a way to set color scheme pre-navigation in some cases
 */
export const state = (): ColorSchemeState => {
  return {
    override: null,
    lastColorScheme: null,
    shouldOverride: false,
  };
};

export const getters = getterTree(state, {
  currentUserColorScheme(state, getters, rootState): ColorScheme | undefined {
    // TODO: type root getters
    return rootState.profiles[rootState.currentUser.name]?.colorScheme;
  },
  currentColorScheme(state, getters): ColorScheme {
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
});

export const mutations = mutationTree(state, {
  setColorSchemeOverride(state, override: ColorScheme) {
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
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    setOverrideFromProfile(context, profileName: string): void {
      context.commit(
        'setColorSchemeOverride',
        this.app.$accessor.profiles[profileName].colorScheme
      );
    },
  }
);
