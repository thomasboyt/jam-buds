import * as React from 'react';
import {Link} from 'react-router';
import {IPromiseBasedObservable} from 'mobx-utils';
import {observer} from 'mobx-react';

import {PublicUser, ColorScheme} from '../../../universal/resources';

interface Props {
  users: PublicUser[];
  colorScheme: ColorScheme;
}

@observer
class UsersList extends React.Component<Props, {}> {
  render() {
    const {users, colorScheme} = this.props;

    return (
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link to={`/users/${user.twitterName}`} style={{color: colorScheme.linkColor}}>
              {user.twitterName}
            </Link>
          </li>
        ))}
      </ul>
    )
  }
}

export default UsersList;