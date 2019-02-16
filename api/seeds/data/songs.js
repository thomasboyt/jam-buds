const songs = [
  {
    id: 1,
    artists: ['Lynyrd Skynyrd'],
    album: "Pronounced' Leh-'Nerd 'Skin-'Nerd",
    title: 'Free Bird',
    spotify_id: '5EWPGh7jbTNO2wakv8LjUI',
    album_art:
      'https://i.scdn.co/image/a30e6162907f82794bd32351ca8a8e0c6b91d8f5',
  },
  {
    id: 2,
    artists: ['The Chemical Brothers'],
    album: 'Brotherhood',
    title: "Block Rockin' Beats - 2003 Digital Remaster",
    spotify_id: '2wPFy7SAFnt9Nj2TipWcqb',
    album_art:
      'https://i.scdn.co/image/c48d3e3e9b0883b598cedbe36db912f7f1137a1e',
  },
  {
    id: 3,
    artists: ['Incubus'],
    album: 'Make Yourself',
    title: 'Drive',
    spotify_id: '7nnWIPM5hwE3DaUBkvOIpy',
    album_art:
      'https://i.scdn.co/image/c002bd0cd798e8cb5873e3513a987287c2993bea',
  },
  {
    id: 4,
    created_at: '2017-01-12 16:44:26.642494-05',
    artists: ['Guerilla Toss'],
    album: 'Eraser Stargazer',
    title: 'Diamond Girls',
    spotify_id: '4sxikSNTEKjvpdupyxxjGL',
    album_art:
      'https://i.scdn.co/image/327c4479345a3db7d0f3fbd5352e778473eea4eb',
  },
  {
    id: 6,
    created_at: '2017-01-17T16:43:09.414925-05:00',
    artists: ['Buscabulla', 'Helado Negro'],
    album: 'Frío (feat. Helado Negro)',
    title: 'Frío (feat. Helado Negro)',
    spotify_id: '3hjBsjNmm2fFCggCtP5hJx',
    album_art:
      'https://i.scdn.co/image/e9ee68a74f3930e18237b3a53953820f1a2d9a5f',
  },
];

const posts = [
  {
    song_id: 1,
    user_id: 2,
    created_at: '2016-12-02 16:39:30.055298-05',
  },
  {
    song_id: 2,
    user_id: 1,
    created_at: '2016-12-03 16:39:30.055298-05',
  },
  {
    song_id: 3,
    user_id: 4,
    created_at: '2016-12-04 16:39:30.055298-05',
  },
  {
    song_id: 4,
    created_at: '2017-01-12 16:44:26.766809-05',
    user_id: 1,
  },

  {
    id: 6,
    created_at: '2017-01-17T16:43:09.421355-05:00',
    song_id: 6,
    user_id: 1,
    note: 'Here is a test note',
  },
];

module.exports = {
  songs,
  posts,
};
