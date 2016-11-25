import {getAuthToken, setAuthToken} from './util/authToken';

window.addEventListener('message', async (event: MessageEvent) => {
  const data = JSON.parse(event.data);

  if (data.type === 'twitterAuth') {
    const {token, secret} = data;
    const apiUrl = process.env.SERVER_URL;

    const resp = await fetch(`${apiUrl}/twitter-auth-token`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authToken: getAuthToken,
        twitterToken: token,
        twitterSecret: secret,
      }),
    });

    if (resp.status !== 200) {
      console.log(resp);
      throw new Error('Twitter auth error');
    }

    const respData: any = await resp.json();

    setAuthToken(respData.authToken);
    document.location.reload();
  }
});
