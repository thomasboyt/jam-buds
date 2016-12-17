import * as React from 'react';
import TwitterAuth from '../TwitterAuth';

class LoggedOutHome extends React.Component<{}, {}> {
  render() {
    return (
      <div className="logged-out-homepage">
        <h2>hey! listen!</h2>

        <div className="lower">
          <p>this is <strong>jam buds</strong>, a site to share music with friends</p>

          <p>
            you can post songs you like, follow your friends, and listen to what everyone you know is listening to.
          </p>

          <TwitterAuth />
        </div>

        <div className="attribution">
          site by <a href="https://twitter.com/thomasABoyt">thomas</a>
          {' '}&middot;{' '}
          good doggo by <a href="http://twitter.com/rainbowfission">@rainbowfission</a>
        </div>
      </div>
    );
  }
}

export default LoggedOutHome;