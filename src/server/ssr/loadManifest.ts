import axios from 'axios';

// The manifest is cached here if in production mode, since it won't change!!
let manifest: any = null;
export default async function loadManifest(): Promise<any> {
  if (process.env.NODE_ENV === 'production' && manifest) {
    return manifest;
  }

  const url = `${process.env.STATIC_URL}/manifest.json`;
  const resp = await axios.get(url);
  manifest = resp.data;
  return manifest;
}
