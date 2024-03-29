package club.jambuds.dao

import club.jambuds.model.Song
import club.jambuds.model.SongWithMeta
import club.jambuds.model.ItemSource
import club.jambuds.model.cache.SongSearchCache
import org.jdbi.v3.sqlobject.customizer.BindList
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

interface SongDao {
    @SqlQuery
    @UseClasspathSqlLocator
    fun getSongsByIds(
        @BindList("songIds") songIds: List<Int>,
        currentUserId: Int = -1
    ): List<SongWithMeta>

    @SqlQuery
    @UseClasspathSqlLocator
    fun getSongsByMixtapeId(mixtapeId: Int, currentUserId: Int? = -1): List<SongWithMeta>

    @SqlQuery
    @UseClasspathSqlLocator
    fun getSongBySpotifyId(spotifyId: String, currentUserId: Int): SongWithMeta?

    @SqlQuery(
        """
        SELECT *
        FROM songs
        WHERE songs.id = :id
        """
    )
    fun getSongById(id: Int): Song?

    @SqlQuery
    @UseClasspathSqlLocator
    fun getSongByAppleMusicId(appleMusicId: String, currentUserId: Int): SongWithMeta?

    @SqlQuery
    @UseClasspathSqlLocator
    fun getSongByBandcampUrl(bandcampUrl: String, currentUserId: Int): SongWithMeta?

    fun getSongBySource(source: ItemSource, key: String, currentUserId: Int): SongWithMeta? {
        return when (source) {
            ItemSource.SPOTIFY -> getSongBySpotifyId(key, currentUserId)
            ItemSource.BANDCAMP -> getSongByBandcampUrl(key, currentUserId)
            ItemSource.APPLEMUSIC -> getSongByAppleMusicId(key, currentUserId)
        }
    }

    @SqlUpdate
    @UseClasspathSqlLocator
    @GetGeneratedKeys
    fun createSong(
        title: String,
        artists: List<String>,
        album: String,
        albumArt: String,
        spotifyId: String?,
        isrcId: String?,
        appleMusicId: String?,
        appleMusicUrl: String?,
        bandcampId: String?,
        bandcampUrl: String?,
        bandcampCanStream: Boolean?
    ): Song

    fun createSongFromCacheEntry(cacheEntry: SongSearchCache): Song {
        return createSong(
            title = cacheEntry.title,
            artists = cacheEntry.artists,
            album = cacheEntry.album,
            albumArt = cacheEntry.albumArt,
            isrcId = cacheEntry.isrc,
            spotifyId = cacheEntry.spotifyId,
            appleMusicId = cacheEntry.appleMusicId,
            appleMusicUrl = cacheEntry.appleMusicUrl,
            bandcampId = cacheEntry.bandcampId,
            bandcampUrl = cacheEntry.bandcampUrl,
            bandcampCanStream = cacheEntry.bandcampStreamingAvailable
        )
    }

    @SqlQuery
    @UseClasspathSqlLocator
    fun getSongExistsById(songId: Int): Boolean

    @SqlQuery
    @UseClasspathSqlLocator
    fun hasSongListenedEntry(userId: Int, songId: Int): Boolean

    @SqlUpdate
    @UseClasspathSqlLocator
    fun createSongListenedEntry(userId: Int, songId: Int)

    @SqlUpdate
    @UseClasspathSqlLocator
    fun deleteSongListenedEntry(userId: Int, songId: Int)
}
