import * as React from 'react';
import {inject, observer} from 'mobx-react';

import UserStore from '../stores/UserStore';

import ColorSchemeProvider from './ColorSchemeProvider';
import MainWrapper from './MainWrapper';
import SidebarWrapper from './SidebarWrapper';

interface Props {
  userStore?: UserStore;
}

@inject((allStores) => ({
  userStore: allStores.userStore,
})) @observer
export default class UserColorSchemeWrapper extends React.Component<Props, {}> {
  render() {
    const {userStore} = this.props;

    return (
      <SidebarWrapper>
        <ColorSchemeProvider colorScheme={userStore!.colorScheme}>
          <MainWrapper>
            {this.props.children}
          </MainWrapper>
        </ColorSchemeProvider>
      </SidebarWrapper>
    );
  }
}