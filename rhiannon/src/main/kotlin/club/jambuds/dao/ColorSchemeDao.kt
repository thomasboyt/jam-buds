package club.jambuds.dao

import club.jambuds.model.ColorScheme
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

@UseClasspathSqlLocator
interface ColorSchemeDao {
    @SqlQuery
    fun getColorSchemeByUserId(userId: Int): ColorScheme?

    @SqlUpdate
    fun setColorSchemeForUserId(userId: Int, backgroundGradientName: String, textColor: String)
}
