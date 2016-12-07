import * as React from 'react';

function openTwitterAuth(e: React.MouseEvent<any>) {
  e.preventDefault();

  const apiUrl = process.env.SERVER_URL;

  window.open(
    `${apiUrl}/twitter-sign-in`,
    'TwitterSignIn',
    'resizable,scrolbars,status,width=500,height=400'
  );
}

const TwitterAuth = () => (
  <div className="twitter-auth">
    <p>want to get started?</p>

    <button onClick={openTwitterAuth}>
      Sign in with Twitter
    </button>
  </div>
);

export default TwitterAuth;