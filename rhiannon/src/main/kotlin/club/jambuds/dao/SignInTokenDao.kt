package club.jambuds.dao

import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

interface SignInTokenDao {
    @SqlUpdate(
        """
        INSERT INTO sign_in_tokens
            (email, token)
        VALUES
            (:email, :token)
    """
    )
    fun createSignInToken(email: String, token: String)

    @SqlQuery("SELECT email FROM sign_in_tokens WHERE token=:token")
    fun getEmailFromSignInToken(token: String): String?

    @SqlUpdate("DELETE FROM sign_in_tokens WHERE token=:token")
    fun deleteSignInToken(token: String)
}
