package club.jambuds.dao

import club.jambuds.model.Album
import club.jambuds.model.cache.SpotifyAlbumSearchCache
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

    @SqlUpdate(
        """
        INSERT INTO albums
            (title, artists, album_art, spotify_id, apple_music_id, apple_music_url)
        VALUES
            (:title, :artists, :albumArt, :spotifyId, :appleMusicId, :appleMusicUrl)
        """
    )
    @GetGeneratedKeys
    fun createAlbum(
        title: String,
        artists: List<String>,
        albumArt: String?,
        spotifyId: String?,
        appleMusicId: String?,
        appleMusicUrl: String?
    ): Album

    fun createAlbumFromCacheEntry(searchCacheEntry: SpotifyAlbumSearchCache): Album {
        return createAlbum(
            title = searchCacheEntry.spotify.name,
            artists = searchCacheEntry.spotify.artists.map { it.name },
            albumArt = searchCacheEntry.spotify.images[0].url,
            spotifyId = searchCacheEntry.spotify.id,
            appleMusicUrl = searchCacheEntry.appleMusicUrl,
            appleMusicId = searchCacheEntry.appleMusicId
        )
    }
}
