package club.jambuds.dao

import club.jambuds.model.Mixtape
import club.jambuds.model.MixtapePreview
import org.jdbi.v3.sqlobject.customizer.BindList
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

@UseClasspathSqlLocator
interface MixtapeDao {
    @SqlQuery
    fun getMixtapesByIds(@BindList("mixtapeIds") mixtapeIds: List<Int>): List<MixtapePreview>

    @SqlQuery
    fun getMixtapeById(mixtapeId: Int): Mixtape?

    @SqlUpdate
    @GetGeneratedKeys
    fun createMixtape(userId: Int, title: String, slug: String): Mixtape

    @SqlUpdate
    fun deleteMixtapeById(id: Int)
}
