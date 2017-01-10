import * as React from 'react';
import {Link} from 'react-router';
import {inject, observer} from 'mobx-react';

import FeedStore from '../../stores/FeedStore';
import UserStore from '../../stores/UserStore';

import Playlist from '../Playlist';
import UserColorSchemeWrapper from '../UserColorSchemeWrapper';

interface Props {
  feedStore?: FeedStore;
  userStore?: UserStore,
}

@inject((allStores) => ({
  feedStore: allStores.feedStore,
  userStore: allStores.userStore,
})) @observer
class LoggedInHome extends React.Component<Props, {}> {
  componentWillMount() {
    this.props.feedStore!.reset();
  }

  renderNoItemsPlaceholder() {
    return (
      <div className="main-placeholder">
        Your feed doesn't have any entries yet! <Link to="/find-friends">Find some friends to follow!</Link>
      </div>
    );
  }

  render() {
    const {items, nextPageRequest, loadedFirstPage} = this.props.feedStore!.entryList;

    return (
      <UserColorSchemeWrapper>
        <div className="playlist">
          <h2>your feed</h2>
          <Playlist entryList={this.props.feedStore!.entryList}
            noItemsPlaceholder={() => this.renderNoItemsPlaceholder()} />
        </div>
      </UserColorSchemeWrapper>
    );
  }
}

export default LoggedInHome;