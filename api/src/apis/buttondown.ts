import axios from 'axios';
import externalCallWrapper from '../util/externalCallWrapper';

function getApiHeaders() {
  if (!process.env.BUTTONDOWN_API_KEY) {
    throw new Error('missing buttondown api key!');
  }

  return {
    Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
  };
}

export async function getButtondownSubscriptionId(
  email: string
): Promise<string | null> {
  if (process.env.DISABLE_BUTTONDOWN) {
    return null;
  }

  const resp = await externalCallWrapper(
    axios.get('https://api.buttondown.email/v1/subscribers', {
      params: {
        email,
        type: 'regular',
      },
      headers: getApiHeaders(),
    })
  );

  const result = resp.data.results[0];
  if (result) {
    return result.id;
  } else {
    return null;
  }
}

export async function subscribeToButtondownNewsletter(
  email: string
): Promise<void> {
  await externalCallWrapper(
    axios.post(
      'https://api.buttondown.email/v1/subscribers',
      { email },
      {
        headers: getApiHeaders(),
      }
    )
  );
}

export async function unsubscribeFromButtondownNewsletter(
  buttondownId: string
): Promise<void> {
  await externalCallWrapper(
    axios.delete(
      `https://api.buttondown.email/v1/subscribers/${buttondownId}`,
      {
        headers: getApiHeaders(),
      }
    )
  );
}
