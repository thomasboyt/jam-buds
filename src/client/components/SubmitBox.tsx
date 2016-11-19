import * as React from 'react';

import getSongsSearch from '../api/getSongsSearch';

class SubmitBox extends React.Component<{}, {}> {
  input: HTMLInputElement;

  handleSubmit(e: React.MouseEvent<any>) {
    e.preventDefault();

    const query = this.input.value;

    // todo: this should be an action lol
    getSongsSearch(query);
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