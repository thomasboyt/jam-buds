import * as React from 'react';

import {ColorScheme} from '../../universal/resources';

interface Context {
  colorScheme: ColorScheme;
}

/**
 * Injects this.context.colorScheme as a prop
 */
export default function withColorScheme<C extends React.ComponentClass<any>>(Component: C): C {
  return class ColorSchemeWrapper extends React.Component<any, {}> {
    context: Context;

    static contextTypes = {
      colorScheme: React.PropTypes.object,
    };

    render() {
      const {colorScheme} = this.context;

      return <Component {...this.props} colorScheme={colorScheme} />;
    }
  } as any;
}