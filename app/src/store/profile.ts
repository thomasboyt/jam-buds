import Vue from 'vue';
import { mutationTree, getterTree, actionTree } from 'typed-vuex';
import { ApiSchema } from '~/api/_helpers';

type ColorScheme = ApiSchema<'ColorScheme'>;
type Profile = ApiSchema<'UserProfile'>;

interface ProfileStoreState {
  profiles: Record<string, Profile>; // name -> profile
}

export const state = (): ProfileStoreState => {
  return {
    profiles: {},
  };
};

export const getters = getterTree(state, {
  currentUserColorScheme(state, getters, rootState): ColorScheme | undefined {
    // TODO: type root state
    const currentUserName = rootState.currentUser.user?.name as
      | string
      | undefined;
    if (!currentUserName) {
      return undefined;
    }
    return state.profiles[currentUserName]?.colorScheme;
  },
});

export const mutations = mutationTree(state, {
  addProfiles(state, profiles: Profile[]) {
    for (const profile of profiles) {
      Vue.set(state.profiles, profile.name, profile);
    }
  },
  updateProfileColorScheme(
    state,
    { name, colorScheme }: { name: string; colorScheme: ColorScheme }
  ) {
    state.profiles[name].colorScheme = colorScheme;
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    async loadProfileForUser(context, userName: string): Promise<void> {
      const resp = await this.$axios({
        url: `/users/${userName}`,
        method: 'GET',
      });

      const data = resp.data as ApiSchema<'GetUserProfileResponse'>;

      context.commit('addProfiles', [data.userProfile]);
    },
  }
);
