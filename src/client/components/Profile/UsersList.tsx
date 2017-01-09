import * as React from 'react';
import Link from '../Link';
import {IPromiseBasedObservable} from 'mobx-utils';
import {observer} from 'mobx-react';

import {PublicUser, ColorScheme} from '../../../universal/resources';

interface Props {
  users: PublicUser[];
}

@observer
class UsersList extends React.Component<Props, {}> {
  render() {
    const {users} = this.props;

    return (
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link to={`/users/${user.twitterName}`}>
              {user.twitterName}
            </Link>
          </li>
        ))}
      </ul>
    )
  }
}

export default UsersList;