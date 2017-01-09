import * as React from 'react';

import {ColorScheme} from '../../universal/resources';

interface Props {
  colorScheme: ColorScheme | null;
}

let lastColorScheme: ColorScheme | null = null;

export default class ColorSchemeProvider extends React.Component<Props, {}> {
  static childContextTypes = {
    colorScheme: React.PropTypes.object,
  };

  componentDidUpdate(props: Props) {
    if (props.colorScheme) {
      lastColorScheme = props.colorScheme;
    }
  }

  getChildContext() {
    return {
      colorScheme: this.props.colorScheme || lastColorScheme,
    };
  }

  render() {
    // XXX: TypeScript doesn't like this and I don't know why
    return this.props.children as any;
  }
}