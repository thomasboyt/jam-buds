import * as React from 'react';

import {ColorScheme} from '../../universal/resources';
import withColorScheme from './withColorScheme';

interface Props {
  colorScheme?: ColorScheme;
}

@withColorScheme
export default class MainWrapper extends React.Component<Props, {}> {
  render() {
    const colorScheme = this.props.colorScheme!;

    const style = {
      backgroundColor: colorScheme.backgroundColor,
      color: colorScheme.textColor,
    };

    return (
      <div className="main" style={style}>
        <div className="main-inner">
          {this.props.children}
        </div>
      </div>
    );
  }
}
