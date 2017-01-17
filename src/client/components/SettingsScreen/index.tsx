import * as React from 'react';
import Link from '../Link';
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

        <p>
          <em>(psst: if you've got a set of colors you'd like to use that's not here, feel free to <Link href="https://twitter.com/thomasABoyt">shoot me a tweet</Link>! I'll probably just add it as a preset here)</em>
        </p>

      </UserColorSchemeWrapper>
    );
  }
}