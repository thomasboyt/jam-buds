import * as React from 'react';

import {Link, Router} from 'react-router';

import withColorScheme from './withColorScheme';
import {ColorScheme} from '../../universal/resources';

// This is vendored-ish because of this bug:
// http://stackoverflow.com/questions/41431433/typescript-issues-with-props-of-higher-order-stateless-component-in-react
interface Props {
  activeStyle?: React.CSSProperties;
  activeClassName?: string;
  to?: Router.RoutePattern;
  colorScheme?: ColorScheme;
  href?: string;
}

@withColorScheme
export default class StyledLink extends React.Component<Props, {}> {
  render() {
    const style = {
      color: this.props.colorScheme!.linkColor,
    };

    if (this.props.href) {
      return (
        <a href={this.props.href} style={style}>
          {this.props.children}
        </a>
      );

    } else {
      return (
        <Link
          activeStyle={this.props.activeStyle} activeClassName={this.props.activeClassName}
          to={this.props.to!}
          style={style}>
          {this.props.children}
        </Link>
      )
    }
  }
}