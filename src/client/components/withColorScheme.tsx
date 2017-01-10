import * as React from 'react';
import {inject, observer} from 'mobx-react';

import ColorSchemeStore from '../stores/ColorSchemeStore';

/**
 * Injects the current color scheme as a prop.
 */
export default function withColorScheme<C extends React.ComponentClass<any>>(Component: C): C {
  @inject((allStores) => ({
    colorSchemeStore: allStores.colorSchemeStore as ColorSchemeStore,
  })) @observer
  class ColorSchemeWrapper extends React.Component<any, {}> {
    render() {
      const {colorScheme} = this.props.colorSchemeStore!;

      return <Component {...this.props} colorScheme={colorScheme} />;
    }
  }

  // TODO: Properly annotate this...
  return ColorSchemeWrapper as any;
}