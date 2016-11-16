import {createStore, applyMiddleware, compose, combineReducers} from 'redux';
import {syncHistoryWithStore, routerMiddleware} from 'react-router-redux';
import {History} from 'history';

import thunk from 'redux-thunk';

import reducers from './reducers';

// middlewares are exported here so tests with mocked stores can use them
export const middlewares = [
  thunk,
];

export default function makeStore(browserHistory: History) {
  const middleware = [
    routerMiddleware(browserHistory),
    ...middlewares,
  ];

  const appReducer = combineReducers(reducers);

  const store = createStore(
    appReducer,
    applyMiddleware(...middleware),
  );

  syncHistoryWithStore(browserHistory, store);

  return store;
}