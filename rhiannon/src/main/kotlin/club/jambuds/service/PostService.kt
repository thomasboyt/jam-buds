package club.jambuds.service

import club.jambuds.dao.PostDao
import club.jambuds.dao.SongDao
import club.jambuds.model.SongWithMeta
import io.javalin.http.BadRequestResponse

class PostService(
    private val postDao: PostDao,
    private val songDao: SongDao,
    private val searchService: SearchService
) {
    fun createPostForSong(currentUserId: Int, spotifyId: String): SongWithMeta {
        var song = songDao.getSongBySpotifyId(spotifyId, currentUserId)

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
                postDao.getUserPostForSongId(songId = song.id, userId = currentUserId)
            if (existingPost != null) {
                throw BadRequestResponse("You have already posted this song")
            }
        }

        postDao.createPost(userId = currentUserId, songId = song.id)

        // TODO: Send tweet here?

        return song
    }
}
