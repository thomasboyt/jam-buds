import * as React from 'react';
import * as _ from 'lodash';

function scriptForChunk(manifest: any, name: string): React.ReactNode {
  const assets = manifest.assetsByChunkName[name];
  const filename = assets.find((asset: string) => asset.endsWith('.js'));
  return (
    <script src={`${process.env.STATIC_URL}/${filename}`}></script>
  );
}

function styleForChunk(manifest: any, name: string): React.ReactNode {
  const assets = manifest.assetsByChunkName[name];
  const filename = assets.find((asset: string) => asset.endsWith('.css'));
  return (
    <link href={`${process.env.STATIC_URL}/${filename}`} rel="stylesheet" />
  );
}

interface Props {
  meta: {[s: string]: string},
  manifest: any,
  pageData: any,
  innerHtml: string;
}

export default class Page extends React.Component<Props, {}> {
  renderMeta() {
    const {meta} = this.props;
    const tags = _.map(meta, (val, key) =>
      <meta key={key} name={key} content={val} />
    );

    return tags;
  }

  render() {
    const {manifest, pageData, innerHtml} = this.props;

    return (
      <html>
        <head>
          <title>Jam Buds</title>
          <script src="https://www.youtube.com/iframe_api"></script>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {styleForChunk(manifest, 'app')}
          {this.renderMeta()}
        </head>

        <body>
          <div className="react-root" dangerouslySetInnerHTML={{
            __html: innerHtml,
          }} />
          <script dangerouslySetInnerHTML={{
            __html: `window.__PAGE_DATA__ = ${JSON.stringify(pageData)};`
          }} />
          {scriptForChunk(manifest, 'vendor')}
          {scriptForChunk(manifest, 'app')}
        </body>
      </html>
    );
  }
}
