import * as React from 'react';

interface Props {
  glyph: string;
  className?: string;
}

export default class Icon extends React.Component<Props, {}> {
  static defaultProps = {
    className: '',
  };

  render() {
    const {glyph, className} = this.props;

    return (
      <svg className={`icon ${className}`}
        dangerouslySetInnerHTML={{ __html: `<use xlink:href=${glyph}></use>` }} />
    );
  }
}