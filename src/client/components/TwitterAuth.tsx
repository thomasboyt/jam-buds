import * as React from 'react';
import getHttpApiUrl from '../util/getHttpApiUrl';

function openTwitterAuth(e: React.MouseEvent<any>) {
  e.preventDefault();

  window.open(
    `${getHttpApiUrl()}/twitter-sign-in`,
    'TwitterSignIn',
    'resizable,scrolbars,status,width=500,height=400'
  );
}

const TwitterAuth = () => (
  <div>
    <a href="#" onClick={openTwitterAuth}>Sign in</a>
  </div>
);

export default TwitterAuth;