import * as React from 'react';
import {Link} from 'react-router';
import {inject, observer} from 'mobx-react';

import FindFriendsStore from '../../stores/FindFriendsStore';
import {PublicUser} from '../../../universal/resources';

import SidebarWrapper from '../SidebarWrapper';
import getFriendSuggestions from '../../api/getFriendSuggestions';

interface Props {
  findFriendsStore?: FindFriendsStore;
}

@inject((allStores) => ({
  findFriendsStore: allStores.findFriendsStore,
})) @observer
export default class FindFriendsScreen extends React.Component<Props, {}> {
  renderLoaded(suggestions: PublicUser[]) {
    if (suggestions.length === 0) {
      return (
        <div>
          No suggestions found! Try inviting your Twitter friends to Jam Buds!
        </div>
      );
    }

    return (
      <ul>
        {suggestions.map((user) =>
          <li key={user.id}>
            <Link to={`/playlist/${user.twitterName}`}>@{user.twitterName}</Link>
          </li>)
        }
      </ul>
    );
  }

  render() {
    const {suggestionsPromise} = this.props.findFriendsStore!;

    return (
      <SidebarWrapper>
        <h2>Find Friends</h2>
        {suggestionsPromise.case({
          pending: () => <div>Loading Twitter friends...</div>,
          rejected: () => <div>Error loading!</div>,
          fulfilled: (suggestions) => this.renderLoaded(suggestions),
        })}
      </SidebarWrapper>
    );
  }
}