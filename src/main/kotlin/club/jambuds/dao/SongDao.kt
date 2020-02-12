package club.jambuds.dao

import club.jambuds.model.SongWithMeta
import org.jdbi.v3.sqlobject.customizer.BindList
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.SqlQuery

@UseClasspathSqlLocator
interface SongDao {
    @SqlQuery
    fun getSongsByIds(@BindList("songIds") songIds: List<Int>, currentUserId: Int = -1): List<SongWithMeta>
}
