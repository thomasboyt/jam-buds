import * as React from 'react';

import {SearchResult} from '../../universal/resources';

interface Props {
  track: SearchResult;
}

export default class SearchResultItem extends React.Component<Props, {}> {
  render() {
    const {track} = this.props;

    return (
      <li>
        {track.artists.join(', ')} - {track.name}
      </li>
    );
  }
}