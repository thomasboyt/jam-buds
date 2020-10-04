import isRootPage from '~/util/isRootPage';

class NativeBridge {
  send(msg) {
    window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }

  escapeNativeBack() {
    this.send({
      type: 'escapeNativeBack',
    });
  }

  signOut() {
    this.send({
      type: 'signOut',
    });
  }
}

export default (context, inject) => {
  if (!window.ReactNativeWebView) {
    return;
  }

  const nativeBridge = new NativeBridge();
  inject('nativeBridge', nativeBridge);

  document.addEventListener('message', (evt) => {
    const msg = JSON.parse(evt.data);

    if (msg.type === 'nativeBack') {
      if (isRootPage(context.store, context.route)) {
        nativeBridge.escapeNativeBack();
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
