// TODO: turn this into a mixin?
export function showModal(router, route, modalName) {
  const query = { ...route.query, modal: modalName };
  router.push({ ...route, query });
}

export function closeModal(router, route) {
  if (history.state?.fromApp) {
    // BIG ASSUMPTION here, but hope that we can just go back to leave modal
    router.go(-1);
  } else {
    // this is like if you enter the site w an open modal? kinda weird
    const query = { ...route.query };
    delete query.modal;
    router.replace({ ...route, query });
  }
}
