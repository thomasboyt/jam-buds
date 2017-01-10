import * as React from 'react';
import {withRouter} from 'react-router';
import {observer, inject} from 'mobx-react';

import ProfileStore from '../../stores/ProfileStore';
import ColorSchemeStore from '../../stores/ColorSchemeStore';

import SidebarWrapper from '../SidebarWrapper';
import MainWrapper from '../MainWrapper';
import ColorSchemeProvider from '../ColorSchemeProvider';
import Loader, {LoaderProps} from '../Loader';
import ProfileNav from './ProfileNav';

interface Props {
  title: string;
  params?: any;
  loaderConfig: LoaderProps
  children?: () => JSX.Element;

  profileStore?: ProfileStore;
  colorSchemeStore?: ColorSchemeStore;
}

@withRouter
@inject((allStores) => ({
  profileStore: allStores.profileStore as ProfileStore,
  colorSchemeStore: allStores.colorSchemeStore as ColorSchemeStore,
})) @observer
class ProfileWrapper extends React.Component<Props, {}> {
  componentWillMount() {
    this.props.profileStore!.setUser(this.props.params.name);
    this.props.loaderConfig.startLoading();
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.params.name !== this.props.params.name) {
      this.props.profileStore!.setUser(nextProps.params.name);
      nextProps.loaderConfig.startLoading();
    }
  }

  render() {
    const {loaderConfig, children, profileStore} = this.props;

    if (!children || typeof children !== 'function') {
      throw new Error('child of <ProfileWrapper /> should be a function');
    }

    let content;
    if (!loaderConfig.request) {
      content = null;

    } else {
      content = this.props.loaderConfig.request.case({
        pending: () => <div>Loading...</div>,
        rejected: () => <div>Error loading!</div>,
        fulfilled: this.props.children,
      });
    }

    if (this.props.colorSchemeStore!.exists) {
      content = (
        <MainWrapper>
          <div className="playlist">
            <ProfileNav title={this.props.title} />
            {content}
          </div>
        </MainWrapper>
      );

    }
    return (
      <SidebarWrapper>
        <ColorSchemeProvider colorScheme={profileStore!.colorScheme}>
          {content}
        </ColorSchemeProvider>
      </SidebarWrapper>
    );
  }
}

export default ProfileWrapper;