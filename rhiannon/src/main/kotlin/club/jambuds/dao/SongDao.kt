package club.jambuds.dao

import club.jambuds.model.Song
import club.jambuds.model.SongWithMeta
import club.jambuds.model.cache.SearchCacheEntry
import org.jdbi.v3.sqlobject.customizer.BindList
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

@UseClasspathSqlLocator
interface SongDao {
    @SqlQuery
    fun getSongsByIds(
        @BindList("songIds") songIds: List<Int>,
        currentUserId: Int = -1
    ): List<SongWithMeta>

    @SqlQuery
    fun getSongsByMixtapeId(mixtapeId: Int, currentUserId: Int? = -1): List<SongWithMeta>

    @SqlQuery
    fun getSongBySpotifyId(spotifyId: String, currentUserId: Int): SongWithMeta?

    @SqlUpdate
    @GetGeneratedKeys
    fun createSong(
        title: String,
        artists: List<String>,
        album: String,
        albumArt: String,
        spotifyId: String,
        isrcId: String?,
        appleMusicId: String?,
        appleMusicUrl: String?
    ): Song

    fun createSongFromCacheEntry(cacheEntry: SearchCacheEntry): Song {
        return createSong(
            spotifyId = cacheEntry.spotify.id,
            title = cacheEntry.spotify.name,
            artists = cacheEntry.spotify.artists.map { it.name },
            album = cacheEntry.spotify.album.name,
            albumArt = cacheEntry.spotify.album.images[0].url,
            isrcId = cacheEntry.isrc,
            appleMusicId = cacheEntry.appleMusicId,
            appleMusicUrl = cacheEntry.appleMusicUrl
        )
    }

    @SqlQuery
    fun getSongExistsById(songId: Int): Boolean

    @SqlQuery
    fun hasSongListenedEntry(userId: Int, songId: Int): Boolean

    @SqlUpdate
    fun createSongListenedEntry(userId: Int, songId: Int)

    @SqlUpdate
    fun deleteSongListenedEntry(userId: Int, songId: Int)
}
