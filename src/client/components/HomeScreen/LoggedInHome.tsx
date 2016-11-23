import * as React from 'react';
import {Link} from 'react-router';
import {inject, observer} from 'mobx-react';

import UserStore from '../../stores/UserStore';

interface Props {
  userStore?: UserStore;
}

// some day this is going to be a cool feed thingy...
@inject((allStores) => ({
  userStore: allStores.userStore,
})) @observer
class LoggedInHome extends React.Component<Props, {}> {
  render() {
    const {following} = this.props.userStore!;

    return (
      <div>
        <h2>your buds</h2>

        <ul>
          {following.map((user) => (
            <li key={user.id}>
              <Link to={`/playlist/${user.twitterName}`}>
                {user.twitterName}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default LoggedInHome;