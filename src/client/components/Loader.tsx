import * as React from 'react';
import {IPromiseBasedObservable} from 'mobx-utils';
import {observer} from 'mobx-react';

interface Props {
  startLoading: () => void;
  request: IPromiseBasedObservable<any>;
  children?: () => JSX.Element;
}

@observer
class Loader extends React.Component<Props, {}> {
  componentWillMount() {
    this.props.startLoading();
  }

  render() {
    if (!this.props.request) {
      return null;
    }

    if (!this.props.children || typeof this.props.children !== 'function') {
      throw new Error('child of <Loader /> should be a function');
    }

    return this.props.request.case({
      pending: () => <div>Loading...</div>,
      rejected: () => <div>Error loading!</div>,
      fulfilled: this.props.children,
    });
  }
}

export default Loader;