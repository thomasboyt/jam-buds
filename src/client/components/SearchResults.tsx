import * as React from 'react';
import {observer, inject} from 'mobx-react';
import SearchStore from '../stores/SearchStore';
import SearchResultItem from './SearchResultItem';

interface Props {
  searchStore?: SearchStore;

  // TODO: how do I type-check this thingy?
  location: any;
}

@inject((allStores) => ({
  searchStore: allStores.searchStore as SearchStore,
})) @observer
class SearchResults extends React.Component<Props, {}> {
  componentWillMount() {
    const {query} = this.props.location.query;
    this.props.searchStore!.search(query);
  }

  componentWillReceiveProps(nextProps: Props) {
    const nextQuery = nextProps.location.query.query;

    if (nextQuery !== this.props.location.query.query) {
      this.props.searchStore!.search(nextQuery);
    }
  }

  render() {
    const {results} = this.props.searchStore!;

    return (
      <div>
        <ul>
          {results.map((result) => <SearchResultItem key={result.spotifyId} track={result} />)}
        </ul>
      </div>
    );
  }
}

export default SearchResults;