require('../../styles/main.scss');

import 'whatwg-fetch';

import * as React from 'react';
import {render} from 'react-dom';

const AUTH_TOKEN_KEY = 'jamBudsAuthToken';

let authToken = '';
if (localStorage.getItem(AUTH_TOKEN_KEY)) {
  authToken = localStorage.getItem(AUTH_TOKEN_KEY)!;
}

// async function main() {
//   await fetch(`/api/?authToken=${authToken}`);
// }

function getHttpApiUrl(): string {
  // TODO: Unstub this
  return '/api';
}

function openTwitterAuth(e: React.MouseEvent<any>) {
  e.preventDefault();

  window.open(
    `${getHttpApiUrl()}/twitter-sign-in`,
    'TwitterSignIn',
    'resizable,scrolbars,status,width=500,height=400'
  );
}

const Main = () => (
  <div>
    <a href="#" onClick={openTwitterAuth}>Sign in</a>
  </div>
);

window.addEventListener('message', async (event: MessageEvent) => {
  const data = JSON.parse(event.data);

  if (data.type === 'twitterAuth') {
    const {token, secret} = data;
    const apiUrl = getHttpApiUrl();

    const resp = await fetch(`${apiUrl}/twitter-auth-token`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authToken: localStorage.getItem(AUTH_TOKEN_KEY),
        twitterToken: token,
        twitterSecret: secret,
      }),
    });

    if (resp.status !== 200) {
      console.log(resp);
      throw new Error('Twitter auth error');
    }

    const respData: any = await resp.json();

    localStorage.setItem(AUTH_TOKEN_KEY, respData.authToken);
    document.location.reload();
  }
});

render(<Main />, document.querySelector('.app-container'));