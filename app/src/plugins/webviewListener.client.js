import isRootPage from '~/util/isRootPage';

export default (context) => {
  if (!window.ReactNativeWebView) {
    return;
  }

  document.addEventListener('message', (evt) => {
    const msg = JSON.parse(evt.data);

    if (msg.type === 'nativeBack') {
      if (isRootPage(context.store, context.route)) {
        // TODO: handle profile pages :|
        // nope! we're at the root
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'escapeNativeBack',
          })
        );
      } else {
        if (history.state.fromApp) {
          history.back();
        } else {
          history.push('/');
        }
      }
    }
  });
};
