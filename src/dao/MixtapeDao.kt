package dao

import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.customizer.BindList

import model.MixtapePreview

@UseClasspathSqlLocator
interface MixtapeDao {
    @SqlQuery
    fun getMixtapesByIds(@BindList("mixtapeIds") mixtapeIds: List<Int>): List<MixtapePreview>
}