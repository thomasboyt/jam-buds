import * as React from 'react';
import TwitterAuth from '../TwitterAuth';

class LoggedOutHome extends React.Component<{}, {}> {
  render() {
    return (
      <div>
        <h2>hey!</h2>
        <p>this is <strong>jam buds</strong>, a site to share what you're listening to with friends.</p>

        <TwitterAuth />
      </div>
    );
  }
}

export default LoggedOutHome;