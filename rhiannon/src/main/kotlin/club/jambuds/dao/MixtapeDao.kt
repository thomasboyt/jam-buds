package club.jambuds.dao

import club.jambuds.model.Mixtape
import club.jambuds.model.MixtapePreview
import org.jdbi.v3.sqlobject.customizer.BindList
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

interface MixtapeDao {
    @SqlQuery
    @UseClasspathSqlLocator
    fun getMixtapesByIds(@BindList("mixtapeIds") mixtapeIds: List<Int>): List<MixtapePreview>

    @SqlQuery
    @UseClasspathSqlLocator
    fun getMixtapeById(mixtapeId: Int): Mixtape?

    @SqlUpdate
    @GetGeneratedKeys
    @UseClasspathSqlLocator
    fun createMixtape(userId: Int, title: String, slug: String): Mixtape

    @SqlUpdate
    @UseClasspathSqlLocator
    fun deleteMixtapeById(id: Int)

    @SqlUpdate
    @UseClasspathSqlLocator
    fun addSongToMixtape(mixtapeId: Int, songId: Int)

    @SqlUpdate(
        "DELETE FROM mixtape_song_entries WHERE mixtape_id = :mixtapeId AND song_id = :songId"
    )
    fun removeSongFromMixtape(mixtapeId: Int, songId: Int)
}
