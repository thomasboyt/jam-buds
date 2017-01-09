import * as React from 'react';
import {withRouter} from 'react-router';
import {observer, inject} from 'mobx-react';

import ProfileStore from '../../stores/ProfileStore';
import UserStore from '../../stores/UserStore';

import SidebarWrapper from '../SidebarWrapper';
import MainWrapper from '../MainWrapper';
import ColorSchemeProvider from '../ColorSchemeProvider';
import Loader, {LoaderProps} from '../Loader';
import ProfileNav from './ProfileNav';

interface Props {
  title: string;
  profileStore?: ProfileStore;
  params?: any;
  loaderConfig: LoaderProps
  children?: () => JSX.Element;
}

@withRouter
@inject((allStores) => ({
  profileStore: allStores.profileStore as ProfileStore,
})) @observer
class ProfileWrapper extends React.Component<Props, {}> {
  componentWillMount() {
    this.props.profileStore!.setUser(this.props.params.name);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.params.name !== this.props.params.name) {
      this.props.profileStore!.setUser(this.props.params.name);
    }
  }

  render() {
    const {loaderConfig, children} = this.props;

    if (!children || typeof children !== 'function') {
      throw new Error('child of <ProfileWrapper /> should be a function');
    }

    return (
      <SidebarWrapper>
        <Loader {...loaderConfig}>
          {() => (
            <ColorSchemeProvider colorScheme={this.props.profileStore!.colorScheme}>
              <MainWrapper>
                <div className="playlist">
                  <ProfileNav title={this.props.title} />

                  {children()}
                </div>
              </MainWrapper>
            </ColorSchemeProvider>
          )}
        </Loader>
      </SidebarWrapper>
    );
  }
}

export default ProfileWrapper;