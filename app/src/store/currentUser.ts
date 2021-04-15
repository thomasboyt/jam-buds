import { getterTree, mutationTree, actionTree } from 'typed-vuex';
import { ApiSchema } from '~/api/_helpers';

type PublicUser = ApiSchema<'PublicUser'>;
type CurrentUser = ApiSchema<'CurrentUser'>;
type CurrentUserState = {
  user: CurrentUser | null;
};

export const state = (): CurrentUserState => {
  return {
    user: null,
  };
};

export const getters = getterTree(state, {
  isFollowing: (state) => (name: string) => {
    if (!state.user) {
      return false;
    }
    return state.user.following.some((user) => user.name === name);
  },
});

export const mutations = mutationTree(state, {
  setCurrentUser(state, user: CurrentUser) {
    state.user = user;
  },
  addFollowedUser(state, user: PublicUser) {
    state.user!.following = state.user!.following.concat([user]);
  },
  removeFollowedUser(state, name: string) {
    state.user!.following = state.user!.following.filter(
      (user) => user.name !== name
    );
  },
  disconnectedTwitter(state) {
    state.user!.twitterName = undefined;
  },
  updateUserPrivacy(
    state,
    { showInPublicFeed }: { showInPublicFeed: boolean }
  ) {
    state.user!.showInPublicFeed = showInPublicFeed;
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
