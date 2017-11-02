import * as React from 'react';
import gql from 'graphql-tag';
import {graphql} from 'react-apollo';
import Link from '../Link';

import UserColorSchemeWrapper from '../UserColorSchemeWrapper';

const friendSuggestionsQuery = gql`
  query FriendSuggestions {
    friendSuggestions {
      twitterName
    }
  }
`;

export class FindFriendsScreen extends React.Component<any, any> {
  renderInner() {
    if (this.props.data.loading) {
      return <div className="main-placeholder">Loading Twitter friends...</div>;
    }

    if (this.props.data.error) {
      return <div className="main-placeholder">Error loading!</div>;
    }

    const suggestions = this.props.data.friendSuggestions;

    if (suggestions.length === 0) {
      return (
        <div className="main-placeholder">
          No suggestions found! Try inviting your Twitter friends to Jam Buds!
        </div>
      );
    }

    return (
      <ul>
        {suggestions.map((user: any) =>
          <li key={user.id}>
            <Link to={`/users/${user.twitterName}`}>@{user.twitterName}</Link>
          </li>)
        }
      </ul>
    );
  }

  render() {
    return (
      <UserColorSchemeWrapper>
        <h2>Find Friends</h2>
        {this.renderInner()}
      </UserColorSchemeWrapper>
    );
  }
}

export default graphql(friendSuggestionsQuery)(FindFriendsScreen);