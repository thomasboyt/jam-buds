import {computed, action, observable} from 'mobx';

import {ColorScheme} from '../../universal/resources';

export default class ColorSchemeStore {
  @observable colorScheme: ColorScheme;

  @observable exists: boolean = false;

  @action update(scheme: ColorScheme) {
    this.colorScheme = scheme;
    this.exists = true;
  }
}