import {observable, computed, action} from 'mobx';
import getFriendSuggestions from '../api/getFriendSuggestions';
import {PublicUser} from '../../universal/resources';

import {fromPromise} from 'mobx-utils';

export default class FindFriendsStore {
  @computed get suggestionsPromise() {
    return fromPromise(getFriendSuggestions());
  }
}
