import * as React from 'react';
import {observer} from 'mobx-react';

import PlaylistItem from './PlaylistItem';
import withColorScheme from '../withColorScheme';

import PlaylistEntry from '../../stores/PlaylistEntry';
import PaginatedPlaylistEntriesList from '../../stores/PaginatedPlaylistEntriesList';

import {ColorScheme} from '../../../universal/resources';

interface Props {
  entryList: PaginatedPlaylistEntriesList;
  noItemsPlaceholder: () => JSX.Element;
  colorScheme?: ColorScheme;
}

@withColorScheme
@observer
class Playlist extends React.Component<Props, {}> {
  handleGetNextPage(e: React.MouseEvent<any>) {
    e.preventDefault();
    this.props.entryList.getNextPage();
  }

  renderItems(items: PlaylistEntry[]) {
    if (items.length === 0) {
      return this.props.noItemsPlaceholder();
    }

    return (
      <ul className="playlist-entries">
        {items.map((track, idx) =>
          <li key={track.id}>
            <PlaylistItem
              track={track} trackIndex={idx}
              entryList={this.props.entryList} />
          </li>
        )}
      </ul>
    );
  }

  renderNextPageLoading() {
    const {nextPageRequest, loadedFirstPage, entriesExhausted} = this.props.entryList;

    if (!nextPageRequest) {
      if (entriesExhausted) {
        return null;
      }

      return (
        <a href="#" onClick={(e) => this.handleGetNextPage(e)}>
          Load next page
        </a>
      );
    }

    let className = '';
    if (!loadedFirstPage) {
      className = 'main-placeholder';
    }

    return nextPageRequest.case({
      pending: () => <div className={className}>Loading...</div>,
      rejected: () => <div className={className}>Error loading!</div>,
      fulfilled: () => <div />,
    });
  }

  render() {
    const {items, loadedFirstPage} = this.props.entryList;

    return (
      <div>
        {loadedFirstPage && this.renderItems(items)}
        {this.renderNextPageLoading()}
      </div>
    );
  }
}

export default Playlist;