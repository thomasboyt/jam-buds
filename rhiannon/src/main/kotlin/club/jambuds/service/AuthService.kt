package club.jambuds.service

import club.jambuds.dao.AuthTokenDao
import club.jambuds.dao.SignInTokenDao
import club.jambuds.dao.UserDao
import club.jambuds.responses.SendSignInTokenSkipAuthResponse
import club.jambuds.util.FormValidationErrorResponse
import club.jambuds.util.generateRandomString
import io.javalin.http.BadRequestResponse
import io.sentry.Sentry
import org.slf4j.LoggerFactory
import java.lang.Exception

class AuthService(
    private val userDao: UserDao,
    private val signInTokenDao: SignInTokenDao,
    private val authTokenDao: AuthTokenDao,
    private val followingService: FollowingService,
    private val emailService: EmailService,
    private val buttondownService: ButtondownService,
    private val appUrl: String,
    private val skipAuth: Boolean
) {
    private val logger = LoggerFactory.getLogger(AuthService::class.java.name)

    fun sendSignInToken(email: String, signUpReferral: String?): SendSignInTokenSkipAuthResponse? {
        val token = generateRandomString(24)
        signInTokenDao.createSignInToken(email, token)
        val user = userDao.getUserByEmail(email)

        if (user == null) {
            // sign up
            var link = "${appUrl}/welcome/registration?t=${token}"

            if (signUpReferral != null) {
                link += "&referral=$signUpReferral"
            }

            emailService.sendEmail(
                email = email,
                subject = "Welcome to jambuds.club!",
                templateName = "sign-up",
                data = mapOf("registrationLink" to link)
            )
        } else {
            // sign in
            val link = "${appUrl}/auth/sign-in?t=${token}"
            emailService.sendEmail(
                email = email,
                subject = "Your sign-in link for jambuds.club",
                templateName = "sign-in",
                data = mapOf("name" to user.name, "signInLink" to link)
            )
        }

        if (skipAuth) {
            return SendSignInTokenSkipAuthResponse(
                token = token,
                isRegistration = user == null
            )
        }

        return null
    }

    fun signIn(token: String): String {
        val email = signInTokenDao.getEmailFromSignInToken(token)
            ?: throw BadRequestResponse("Invalid sign-in token")
        signInTokenDao.deleteSignInToken(token)

        val user = userDao.getUserByEmail(email)
            ?: throw BadRequestResponse("A user does not exist for the email attached to this token")

        return createAuthTokenForUserId(user.id)
    }

    private fun createAuthTokenForUserId(id: Int): String {
        val token = generateRandomString(24)
        authTokenDao.createAuthTokenForUserId(id, token)
        return token
    }

    fun registerUser(
        token: String,
        username: String,
        subscribeToNewsletter: Boolean,
        showInPublicFeed: Boolean,
        referral: String?
    ): String {
        val email = signInTokenDao.getEmailFromSignInToken(token)
            ?: throw BadRequestResponse("Invalid registration token")

        if (userDao.getUserByEmail(email) != null) {
            throw BadRequestResponse("A user already exists with this email address")
        }

        if (userDao.getUserByUserName(username) != null) {
            throw FormValidationErrorResponse(listOf("name" to "This username has already been taken."))
        }

        val user =
            userDao.createUser(email = email, name = username, showInPublicFeed = showInPublicFeed)

        signInTokenDao.deleteSignInToken(token)

        if (subscribeToNewsletter) {
            try {
                buttondownService.subscribe(email)
            } catch (err: Exception) {
                logger.error(err.message)
                Sentry.capture(err)
            }
        }

        if (referral != null) {
            try {
                followingService.followUser(userId = user.id, followedUserName = referral)
            } catch (e: BadRequestResponse) {
                // TODO: more granular error check, somehow
                logger.error("Referral user $referral not found for new registration $email")
            }
        }

        return createAuthTokenForUserId(user.id)
    }

    fun deleteAuthToken(token: String) {
        authTokenDao.deleteAuthToken(token)
    }
}
