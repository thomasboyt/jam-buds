import { getterTree, mutationTree, actionTree } from 'typed-vuex';
import { ApiSchema } from '~/api/_helpers';

type PublicUser = ApiSchema<'PublicUser'>;
type CurrentUser = ApiSchema<'CurrentUser'>;
type CurrentUserState = CurrentUser | Record<string, never>; // this sucks lol

export const state = (): CurrentUserState => {
  return {};
};

export const getters = getterTree(state, {
  isFollowing: (state) => (name: string) => {
    return state.following.some((user) => user.name === name);
  },
});

export const mutations = mutationTree(state, {
  setCurrentUser(state, user: CurrentUser) {
    Object.assign(state, user);
  },
  addFollowedUser(state, user: PublicUser) {
    state.following = state.following.concat([user]);
  },
  removeFollowedUser(state, name: string) {
    state.following = state.following.filter((user) => user.name !== name);
  },
  disconnectedTwitter(state) {
    state.twitterName = undefined;
  },
  updateUserPrivacy(
    state,
    { showInPublicFeed }: { showInPublicFeed: boolean }
  ) {
    state.showInPublicFeed = showInPublicFeed;
  },
});

export const actions = actionTree(
  { state, mutations, getters },
  {
    async followUser(context, name: string): Promise<void> {
      const resp = await this.$axios({
        url: `/following/${name}`,
        method: 'PUT',
        data: {
          userName: name,
        },
      });
      const data = resp.data as ApiSchema<'FollowUserResponse'>;
      context.commit('addFollowedUser', data.user);
    },

    async unfollowUser(context, name: string): Promise<void> {
      await this.$axios({
        url: `/following/${name}`,
        method: 'DELETE',
      });

      context.commit('removeFollowedUser', name);
    },

    async signOut(): Promise<void> {
      try {
        await this.$axios({
          url: '/sign-out',
          method: 'POST',
        });
      } catch (err) {
        this.app.$accessor.showErrorModal(null);
        throw err;
      }
    },
  }
);
