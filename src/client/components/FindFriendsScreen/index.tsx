import * as React from 'react';
import gql from 'graphql-tag';
import {graphql, ChildProps} from 'react-apollo';
import Link from '../Link';
import {FriendSuggestionsQuery} from '../../../schema/operationResultTypes';

import UserColorSchemeWrapper from '../UserColorSchemeWrapper';

const friendSuggestionsQuery = gql`
  query FriendSuggestions {
    friendSuggestions {
      twitterName
    }
  }
`;

const withFriendSuggestions = graphql<FriendSuggestionsQuery>(friendSuggestionsQuery);

export class FindFriendsScreen extends React.Component<ChildProps<{}, FriendSuggestionsQuery>, any> {
  renderInner() {
    const data = this.props.data!;

    if (data.loading) {
      return <div className="main-placeholder">Loading Twitter friends...</div>;
    }

    if (data.error) {
      return <div className="main-placeholder">Error loading!</div>;
    }

    const suggestions = data.friendSuggestions!;

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

export default withFriendSuggestions(FindFriendsScreen);