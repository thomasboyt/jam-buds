import Vue from 'vue';
import { mutationTree, getterTree, actionTree } from 'typed-vuex';
import { ApiSchema } from '~/api/_helpers';

type ColorScheme = ApiSchema<'ColorScheme'>;
type Profile = ApiSchema<'UserProfile'>;
type ProfileState = Record<string, Profile>; // name -> profile

export const state = (): ProfileState => {
  return {};
};

export const getters = getterTree(state, {
  currentUserColorScheme(state, getters, rootState): ColorScheme | undefined {
    // TODO: type root state
    return state[rootState.currentUser.name as string]?.colorScheme;
  },
});

export const mutations = mutationTree(state, {
  addProfiles(state, profiles: Profile[]) {
    for (const profile of profiles) {
      Vue.set(state, profile.name, profile);
    }
  },
  updateProfileColorScheme(
    state,
    { name, colorScheme }: { name: string; colorScheme: ColorScheme }
  ) {
    state[name].colorScheme = colorScheme;
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
