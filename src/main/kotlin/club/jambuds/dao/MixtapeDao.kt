package club.jambuds.dao

import club.jambuds.model.MixtapePreview
import org.jdbi.v3.sqlobject.customizer.BindList
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.SqlQuery

@UseClasspathSqlLocator
interface MixtapeDao {
    @SqlQuery
    fun getMixtapesByIds(@BindList("mixtapeIds") mixtapeIds: List<Int>): List<MixtapePreview>
}
