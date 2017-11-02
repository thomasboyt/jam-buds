import {ApolloClient, createNetworkInterface} from 'react-apollo';
import {getAuthToken} from './util/authToken';

const networkInterface = createNetworkInterface({
  uri: '/graphql',
  opts: {
    credentials: 'same-origin',
  }
});

networkInterface.use([{
  applyMiddleware: (req, next) => {
    if (!req.options.headers) {
      req.options.headers = {} as any;  // Create the header object if needed.
    }

    // get the authentication token from cookie if it exists
    if (getAuthToken()) {
      (req.options.headers as any)['X-Auth-Token'] = getAuthToken();
    }
    next();
  },
}]);

export const client = new ApolloClient({
  networkInterface,
});