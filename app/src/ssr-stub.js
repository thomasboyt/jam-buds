// used to stub out dependencies that run SSR-unfriendly code on load (e.g. code
// that references `window`). should only be used for dependencies that
// obviously aren't referenced during SSR, such as stuff that gets used in a
// `mounted()` hook
export default {};
