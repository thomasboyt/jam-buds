import * as React from 'react';
import {inject, observer} from 'mobx-react'

import UserColorSchemeWrapper from '../UserColorSchemeWrapper';
import ColorSchemeOption from './ColorSchemeOption';

import UserStore from '../../stores/UserStore';

import {colorSchemes} from '../../../universal/constants';

interface Props {
  userStore?: UserStore;
}

@inject((allStores) => ({
  userStore: allStores.userStore
})) @observer
export default class SettingsScreen extends React.Component<Props, {}> {
  render() {
    return (
      <UserColorSchemeWrapper>
        <h2>settings</h2>

        <p>
          select a color scheme for your profile!
        </p>

        <ul className="color-scheme-list">
          {colorSchemes.map(
            (colorScheme, idx) => <ColorSchemeOption key={idx} colorScheme={colorScheme} />)}
        </ul>

      </UserColorSchemeWrapper>
    );
  }
}