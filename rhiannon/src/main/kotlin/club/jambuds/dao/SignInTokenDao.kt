package club.jambuds.dao

import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

interface SignInTokenDao {
    @SqlUpdate(
        """
        INSERT INTO sign_in_tokens
            (email, token, short_code)
        VALUES
            (:email, :token, :shortCode)
    """
    )
    fun createSignInToken(email: String, token: String, shortCode: String)

    @SqlQuery("SELECT email FROM sign_in_tokens WHERE token=:token")
    fun getEmailFromSignInToken(token: String): String?

    @SqlQuery("SELECT token FROM sign_in_tokens WHERE email=:email AND short_code=:shortCode")
    fun getSignInTokenFromEmailAndShortCode(email: String, shortCode: String): String?

    @SqlUpdate("DELETE FROM sign_in_tokens WHERE token=:token")
    fun deleteSignInToken(token: String)

    @SqlUpdate("DELETE FROM sign_in_tokens WHERE email=:email")
    fun deleteSignInTokensForUser(email: String)
}
