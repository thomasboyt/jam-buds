import isRootPage from '~/util/isRootPage';

class NativeBridge {
  constructor(RNWV, context) {
    this.RNWV = RNWV;
    this.context = context;
  }

  send(msg) {
    this.RNWV.postMessage(JSON.stringify(msg));
  }

  ready() {
    this.send({
      type: 'ready',
    });
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

  handleMessage(evt) {
    const msg = JSON.parse(evt.data);

    if (msg.type === 'nativeBack') {
      if (isRootPage(this.context.store, this.context.route)) {
        this.escapeNativeBack();
      } else if (history.state.fromApp) {
        history.back();
      } else {
        history.push('/');
      }
    }
  }
}

export default (context, inject) => {
  if (!window.ReactNativeWebView) {
    return;
  }

  const nativeBridge = new NativeBridge(window.ReactNativeWebView, context);
  inject('nativeBridge', nativeBridge);

  // TODO: may want to move this call elsewhere
  nativeBridge.ready();

  // https://github.com/react-native-webview/react-native-webview/issues/1376#issuecomment-627181339
  if (
    navigator.userAgent.includes('iPhone') ||
    navigator.userAgent.includes('iPad')
  ) {
    window.addEventListener('message', (e) => nativeBridge.handleMessage(e));
  } else {
    document.addEventListener('message', (e) => nativeBridge.handleMessage(e));
  }
};
