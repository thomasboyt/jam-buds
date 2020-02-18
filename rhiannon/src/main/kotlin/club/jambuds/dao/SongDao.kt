package club.jambuds.dao

import club.jambuds.model.SongWithMeta
import org.jdbi.v3.sqlobject.customizer.BindList
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

@UseClasspathSqlLocator
interface SongDao {
    @SqlQuery
    fun getSongsByIds(@BindList("songIds") songIds: List<Int>, currentUserId: Int = -1): List<SongWithMeta>

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
    ): SongWithMeta
}
