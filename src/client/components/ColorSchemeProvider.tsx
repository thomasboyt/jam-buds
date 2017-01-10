import * as React from 'react';
import {observable, IObservableValue} from 'mobx';
import {inject, observer} from 'mobx-react';

import ColorSchemeStore from '../stores/ColorSchemeStore';
import {ColorScheme} from '../../universal/resources';

interface Props {
  colorScheme: ColorScheme | null;
  colorSchemeStore?: ColorSchemeStore;
}

@inject((allStores) => ({
  colorSchemeStore: allStores.colorSchemeStore,
})) @observer
export default class ColorSchemeProvider extends React.Component<Props, {}> {
  static childContextTypes = {
    colorScheme: React.PropTypes.object,
  };

  componentWillMount() {
    if (this.props.colorScheme) {
      this.props.colorSchemeStore!.update(this.props.colorScheme);
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.colorScheme) {
      this.props.colorSchemeStore!.update(nextProps.colorScheme);
    }
  }

  render() {
    // XXX: TypeScript doesn't like this and I don't know why
    return this.props.children as any;
  }
}