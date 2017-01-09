import * as React from 'react';
import {observer, inject} from 'mobx-react';

import UserStore from '../../stores/UserStore';
import {ColorScheme} from '../../../universal/resources';

import * as deepEqual from 'deep-equal';
import * as classNames from 'classnames';
import * as tinycolor from 'tinycolor2';

interface Props {
  colorScheme: ColorScheme;
  userStore?: UserStore;
}

@inject((allStores) => ({
  userStore: allStores.userStore as UserStore,
})) @observer
export default class ColorSchemeOption extends React.Component<Props, {}> {
  handleSelect() {
    this.props.userStore!.changeColorScheme(this.props.colorScheme);
  }

  render() {
    const {colorScheme} = this.props;
    const currentColorScheme = this.props.userStore!.colorScheme;

    const isCurrent = currentColorScheme ? deepEqual(colorScheme, currentColorScheme) : false;

    const className = classNames('color-preview', {
      '-active': isCurrent,
    });

    const outlineColor = tinycolor(colorScheme.backgroundColor).isDark() ? 'white' : 'black';

    return (
      <li onClick={() => this.handleSelect()}>
        <div className={className} style={{backgroundColor: colorScheme.backgroundColor, outlineColor}}>
          <div className="color-preview--header" style={{backgroundColor: colorScheme.textColor}} />
          <div className="color-preview--links" style={{backgroundColor: colorScheme.linkColor}} />

          <div className="color-preview--entry"
            style={{backgroundColor: colorScheme.entryBackgroundColor}}>
            <div className="color-preview--entry-text"
              style={{backgroundColor: colorScheme.entryTextColor}} />
            <div className="color-preview--entry-text"
              style={{backgroundColor: colorScheme.entryTextColor}} />
          </div>

          <div className="color-preview--entry"
            style={{backgroundColor: colorScheme.entryBackgroundColor}}>
            <div className="color-preview--entry-text"
              style={{backgroundColor: colorScheme.entryTextColor}} />
            <div className="color-preview--entry-text"
              style={{backgroundColor: colorScheme.entryTextColor}} />
          </div>
        </div>
      </li>
    );
  }
}
