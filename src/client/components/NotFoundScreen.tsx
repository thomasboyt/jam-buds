import * as React from 'react';

const dogs = require('../../../assets/404_dog.jpg');

export default class NotFoundScreen extends React.Component<{}, {}> {
  render() {
    return (
      <div className="not-found-page">
        <img src={dogs} />
      </div>
    );
  }
}