package club.jambuds.dao

import club.jambuds.model.ColorScheme
import org.jdbi.v3.sqlobject.customizer.BindList
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

@UseClasspathSqlLocator
interface ColorSchemeDao {
    @SqlQuery
    fun getColorSchemeByUserId(userId: Int): ColorScheme?

    @SqlQuery
    fun getColorSchemesByUserIds(@BindList("userIds") userIds: List<Int>): List<ColorScheme>

    @SqlUpdate
    fun setColorSchemeForUserId(userId: Int, backgroundGradientName: String, textColor: String)
}
