package club.jambuds.dao

import org.jdbi.v3.sqlobject.statement.SqlUpdate

interface AuthTokenDao {
    @SqlUpdate(
        """
        INSERT INTO auth_tokens
            (user_id, auth_token)
        VALUES
            (:userId, :token)
    """
    )
    fun createAuthTokenForUserId(userId: Int, token: String)

    @SqlUpdate("DELETE FROM auth_tokens WHERE auth_token=:token")
    fun deleteAuthToken(token: String)
}
