package club.jambuds.dao

import club.jambuds.model.Album
import club.jambuds.model.cache.AlbumSearchCache
import club.jambuds.model.ItemSource
import org.jdbi.v3.sqlobject.customizer.BindList
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

private const val LIKES_SUBQUERY = """
    (
        SELECT COUNT(*) FROM likes WHERE likes.album_id=albums.id
    ) AS "meta_like_count",
    EXISTS(
        SELECT 1 FROM likes WHERE likes.user_id=:currentUserId AND likes.album_id=albums.id
    ) AS "meta_is_liked"
"""

interface AlbumDao {
    @SqlQuery(
        """
        SELECT *, $LIKES_SUBQUERY
        FROM albums
        WHERE albums.id IN (<albumIds>);
        """
    )
    fun getAlbumsByIds(
        @BindList("albumIds") albumIds: List<Int>,
        currentUserId: Int = -1
    ): List<Album>

    @SqlQuery(
        """
        SELECT *, $LIKES_SUBQUERY
        FROM albums
        WHERE albums.spotify_id = :spotifyId
        """
    )
    fun getAlbumBySpotifyId(spotifyId: String, currentUserId: Int? = -1): Album?

    @SqlQuery(
        """
        SELECT *, $LIKES_SUBQUERY
        FROM albums
        WHERE albums.bandcamp_url = :bandcampUrl
        """
    )
    fun getAlbumByBandcampUrl(bandcampUrl: String, currentUserId: Int? = -1): Album?

    fun getAlbumBySource(source: ItemSource, key: String, currentUserId: Int? = -1): Album? {
        return when (source) {
            ItemSource.SPOTIFY -> getAlbumBySpotifyId(key, currentUserId)
            ItemSource.BANDCAMP -> getAlbumByBandcampUrl(key, currentUserId)
        }
    }

    @SqlUpdate(
        """
        INSERT INTO albums
            (title, artists, album_art, spotify_id, apple_music_id, apple_music_url, bandcamp_url)
        VALUES
            (:title, :artists, :albumArt, :spotifyId, :appleMusicId, :appleMusicUrl, :bandcampUrl)
        """
    )
    @GetGeneratedKeys
    fun createAlbum(
        title: String,
        artists: List<String>,
        albumArt: String?,
        spotifyId: String?,
        appleMusicId: String?,
        appleMusicUrl: String?,
        bandcampUrl: String?
    ): Album

    fun createAlbumFromCacheEntry(cacheEntry: AlbumSearchCache): Album {
        return createAlbum(
            title = cacheEntry.title,
            artists = cacheEntry.artists,
            albumArt = cacheEntry.albumArt,
            spotifyId = cacheEntry.spotifyId,
            appleMusicId = cacheEntry.appleMusicId,
            appleMusicUrl = cacheEntry.appleMusicUrl,
            bandcampUrl = cacheEntry.bandcampUrl
        )
    }
}
