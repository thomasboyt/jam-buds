const songs = [
  {id: 1, "artists":["Lynyrd Skynyrd"],"album":"Pronounced' Leh-'Nerd 'Skin-'Nerd","title":"Free Bird","spotify_id":"5EWPGh7jbTNO2wakv8LjUI","album_art":"https://i.scdn.co/image/a30e6162907f82794bd32351ca8a8e0c6b91d8f5"},
  {id: 2, "artists":["The Chemical Brothers"],"album":"Brotherhood","title":"Block Rockin' Beats - 2003 Digital Remaster","spotify_id":"2wPFy7SAFnt9Nj2TipWcqb","album_art":"https://i.scdn.co/image/c48d3e3e9b0883b598cedbe36db912f7f1137a1e"},
  {id: 3, "artists":["Incubus"],"album":"Make Yourself","title":"Drive","spotify_id":"7nnWIPM5hwE3DaUBkvOIpy","album_art":"https://i.scdn.co/image/c002bd0cd798e8cb5873e3513a987287c2993bea"},
];

const entries = [
  {
    "song_id":1,
    "user_id":2,
    "youtube_url":"https://www.youtube.com/watch?v=D0W1v0kOELA",
    "created_at": "2016-12-02 16:39:30.055298-05",
  },
  {
    "song_id":2,
    "user_id":1,
    "youtube_url":"https://www.youtube.com/watch?v=A0kluTStX_Y",
    "created_at": "2016-12-01 16:39:30.055298-05",
  },
  {
    "song_id":3,
    "user_id":4,
    "youtube_url":"https://www.youtube.com/watch?v=fgT9zGkiLig",
    "created_at": "2016-12-04 16:39:30.055298-05",
  },
];

module.exports = {
  songs: songs,
  entries: entries,
};