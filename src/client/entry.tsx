require('../../styles/main.scss');

import 'whatwg-fetch';
import './registerSentry';

import * as React from 'react';
import {render} from 'react-dom';

import {createStores, createApp} from './createApp';

const stores = createStores();
const pageData = (window as any).__PAGE_DATA__;
if (pageData.currentUser) {
  stores.userStore.loadUser(pageData.currentUser);
}
(window as any).stores = stores;

render(createApp(stores), document.querySelector('.react-root'));