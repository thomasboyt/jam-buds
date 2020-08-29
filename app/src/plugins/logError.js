export default (ctx, inject) => {
  inject('logError', function (err) {
    console.error(err);
    this.$sentry.captureException(err);
  });
};
