package dao

import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.customizer.BindList

import model.SongWithMeta

@UseClasspathSqlLocator
interface SongDao {
    @SqlQuery
    fun getSongsByIds(@BindList("songIds") songIds: List<Int>, currentUserId: Int = -1): List<SongWithMeta>
}