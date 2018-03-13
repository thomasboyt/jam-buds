import * as React from 'react';

interface Props {
  url: string;
  playing: boolean;
  onEnded: () => void;
}

export default class AudioStream extends React.Component<Props, {}> {
  player: HTMLAudioElement;

  componentDidMount() {
    this.player.addEventListener('ended', this.props.onEnded);
  }

  componentWillUnmount() {
    this.player.removeEventListener('ended', this.props.onEnded);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.playing && !this.props.playing) {
      this.player.play();
    }

    if (!nextProps.playing && this.props.playing) {
      this.player.pause();
    }
  }

  render() {
    const {url} = this.props;
    return <audio src={url} autoPlay ref={(el) => this.player = el!} />;
  }
}