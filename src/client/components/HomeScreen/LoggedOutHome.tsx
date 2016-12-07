import * as React from 'react';
import TwitterAuth from '../TwitterAuth';

class LoggedOutHome extends React.Component<{}, {}> {
  render() {
    return (
      <div className="logged-out-homepage">
        <h2>hey! listen!</h2>
        <p>this is <strong>jam buds</strong>, a site to share music with friends</p>

        <p>
          you can post songs you like, follow your friends, and listen to what everyone you know is listening to.
        </p>

        <TwitterAuth />
      </div>
    );
  }
}

export default LoggedOutHome;