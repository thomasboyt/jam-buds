package club.jambuds.service

import club.jambuds.dao.PostDao
import club.jambuds.dao.SongDao
import club.jambuds.model.SongWithMeta
import club.jambuds.model.User
import io.javalin.http.BadRequestResponse

class PostService(
    private val postDao: PostDao,
    private val songDao: SongDao,
    private val searchService: SearchService,
    private val twitterService: TwitterService,
    private val appUrl: String
) {
    fun createPostForSong(currentUser: User, spotifyId: String, tweetContent: String?): SongWithMeta {
        var song = songDao.getSongBySpotifyId(spotifyId, currentUser.id)

        if (song == null) {
            val cacheEntry = searchService.getOrHydrateSongCache(spotifyId)
            song = songDao.createSong(
                spotifyId = spotifyId,
                title = cacheEntry.spotify.name,
                artists = cacheEntry.spotify.artists.map { it.name },
                album = cacheEntry.spotify.album.name,
                albumArt = cacheEntry.spotify.album.images[0].url,
                isrcId = cacheEntry.isrc,
                appleMusicId = cacheEntry.appleMusicId,
                appleMusicUrl = cacheEntry.appleMusicUrl
            )
        } else {
            val existingPost =
                postDao.getUserPostForSongId(songId = song.id, userId = currentUser.id)
            if (existingPost != null) {
                throw BadRequestResponse("You have already posted this song")
            }
        }

        postDao.createPost(userId = currentUser.id, songId = song.id)

        if (tweetContent != null) {
            val tweetLink = "$appUrl/users/${currentUser.name}?song=${song.id}"
            val tweetContentWithLink = "$tweetContent $tweetLink"
            twitterService.postTweet(currentUser, tweetContentWithLink)
        }

        return song
    }
}
