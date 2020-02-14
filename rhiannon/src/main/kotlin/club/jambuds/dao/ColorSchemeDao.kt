package club.jambuds.dao

import club.jambuds.model.ColorScheme
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.SqlQuery

@UseClasspathSqlLocator
interface ColorSchemeDao {
    @SqlQuery
    fun getColorSchemeByUserId(userId: Int): ColorScheme?
}
