export default function({ $axios }) {
  $axios.onRequest((config) => {
    // TODO: Add a nice request log somehow
    // console.log('Making request to ' + config.url);
  });
}
