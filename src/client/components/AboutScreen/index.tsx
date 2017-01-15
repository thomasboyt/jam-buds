import * as React from 'react';
import Link from '../Link';

import UserColorSchemeWrapper from '../UserColorSchemeWrapper';

export default class AboutScreen extends React.Component<{}, {}> {
  render() {
    return (
      <UserColorSchemeWrapper>
        <h2>what is this thing</h2>

        <p>this is <strong>jam buds</strong>, a site to share music with friends</p>

        <p>
          you can post songs you like, follow your friends, and listen to what everyone you know is listening to.
        </p>

        <h2>who's responsible for this mess</h2>

        <p>
          this site was built by <Link href="https://thomasboyt.com/">thomas</Link>. if you want to yell at him, you can do so on <Link href="https://twitter.com/thomasABoyt">twitter</Link>. you can also <Link to="/users/thomasABoyt">follow him on here</Link> if you'd like.
        </p>

        <p>
          in addition, this site uses the following assets:
        </p>

        <h3>images</h3>

        <ul>
          <li>very good dog by <Link href="http://twitter.com/rainbowfission">@rainbowfission</Link></li>
        </ul>

        <h3>icons</h3>

        <ul>
          <li>Record by Clayton Meador from the Noun Project</li>
          <li>play by Alex Fuller from the Noun Project</li>
          <li>pause by Alex Fuller from the Noun Project</li>
          <li>Skip Forward by Alex Fuller from the Noun Project</li>
          <li>down by Matthias Van Wambeke from the Noun Project</li>
          <li>Close by Viktor Vorobyev from the Noun Project</li>
          <li>Heart by Alfa Design from the Noun Project</li>
          <li>Note by Bernar Novalyi from the Noun Project</li>
          <li>menu by Ismael Ruiz from the Noun Project</li>
        </ul>

        <h2>nerd things</h2>

        <p>
          the code for jam buds is open source and viewable <Link href="https://github.com/thomasboyt/jam-buds">on github</Link>
        </p>

        {process.env.BUILD_SHA && (
          <p>
            running client version {process.env.BUILD_SHA}
          </p>
        )}
      </UserColorSchemeWrapper>
    );
  }
}