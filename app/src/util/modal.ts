import type VueRouter from 'vue-router';
import type { Route, Location } from 'vue-router';

// TODO: turn this into a mixin?
export function showModal(router: VueRouter, route: Route, modalName: string) {
  const query = { ...route.query, modal: modalName };
  router.push({ ...route, query } as Location);
}

export function closeModal(router: VueRouter, route: Route) {
  if (history.state?.fromApp) {
    // BIG ASSUMPTION here, but hope that we can just go back to leave modal
    router.go(-1);
  } else {
    // this is like if you enter the site w an open modal? kinda weird
    const query = { ...route.query };
    delete query.modal;
    router.replace({ ...route, query } as Location);
  }
}
