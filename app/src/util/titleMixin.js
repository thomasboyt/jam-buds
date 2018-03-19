/* Yoinked from https://ssr.vuejs.org/en/head.html */

function getTitle(vm) {
  const { title } = vm.$options;

  if (title) {
    const pageTitle = typeof title === 'function' ? title.call(vm) : title;
    return `${pageTitle} | Jam Buds`;
  }
}

const serverTitleMixin = {
  created() {
    const title = getTitle(this);
    if (title) {
      this.$ssrContext.title = title;
    }
  },
};

const clientTitleMixin = {
  mounted() {
    const title = getTitle(this);
    if (title) {
      document.title = title;
    }
  },
};

export default (process.env.VUE_ENV === 'server'
  ? serverTitleMixin
  : clientTitleMixin);
