const likes = {
  actions: {
    async likeItem(context, { itemType, itemId }) {
      await this.$axios({
        url: `/likes/${itemType}s/${itemId}`,
        method: 'PUT',
      });

      if (itemType === 'song') {
        context.commit('likeSong', itemId);
      } else if (itemType === 'mixtape') {
        context.commit('likeMixtape', itemId);
      } else if (itemType === 'album') {
        context.commit('likeAlbum', itemId);
      }
    },

    async unlikeItem(context, { itemType, itemId }) {
      await this.$axios({
        url: `/likes/${itemType}s/${itemId}`,
        method: 'DELETE',
      });

      if (itemType === 'song') {
        context.commit('unlikeSong', itemId);
      } else if (itemType === 'mixtape') {
        context.commit('unlikeMixtape', itemId);
      } else if (itemType === 'album') {
        context.commit('unlikeAlbum', itemId);
      }
    },
  },
};

export default likes;
