import * as React from 'react';
import {withRouter, InjectedRouter} from 'react-router';

import getSongsSearch from '../api/getSongsSearch';

interface Props {
  router: InjectedRouter;
}

@withRouter
class SubmitBox extends React.Component<Props, {}> {
  input: HTMLInputElement;

  handleSubmit(e: React.MouseEvent<any>) {
    e.preventDefault();

    const query = this.input.value;
    const {router} = this.props;

    router.push({
      pathname: '/search',
      query: {query},
    });
  }

  render() {
    return (
      <div>
        <input type="text" ref={(el) => this.input = el} />
        <button onClick={(e) => this.handleSubmit(e)}>is my shit</button>
      </div>
    );
  }
}

export default SubmitBox;