package club.jambuds.service

import club.jambuds.dao.AuthTokenDao
import club.jambuds.dao.SignInTokenDao
import club.jambuds.dao.UserDao
import club.jambuds.responses.SendSignInTokenSkipAuthResponse
import club.jambuds.responses.ValidateSignInCodeResponse
import club.jambuds.util.FormValidationErrorResponse
import club.jambuds.util.generateRandomNumberString
import club.jambuds.util.generateRandomString
import io.javalin.http.BadRequestResponse
import io.sentry.Sentry
import org.slf4j.LoggerFactory

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

    fun sendSignInToken(
        email: String,
        signUpReferral: String?,
        dest: String?,
        sendCodeInsteadOfLink: Boolean
    ): SendSignInTokenSkipAuthResponse? {
        // ensure a user only has one active sign in token at a time
        signInTokenDao.deleteSignInTokensForUser(email)

        val token = generateRandomString(24)
        val shortCode = generateRandomNumberString(6)
        signInTokenDao.createSignInToken(email, token, shortCode)

        val user = userDao.getUserByEmail(email)
        if (user == null) {
            // sign up
            val link = getRegistrationLink(token, signUpReferral, dest)

            emailService.sendEmail(
                email = email,
                subject = "Welcome to jambuds.club!",
                templateName = "sign-up",
                data = mapOf(
                    "sendCodeInsteadOfLink" to sendCodeInsteadOfLink,
                    "registrationLink" to link,
                    "shortCode" to shortCode
                )
            )
        } else {
            // sign in
            val link = getSignInLink(token, dest)
            emailService.sendEmail(
                email = email,
                subject = "Your sign-in link for jambuds.club",
                templateName = "sign-in",
                data = mapOf(
                    "name" to user.name,
                    "signInLink" to link,
                    "sendCodeInsteadOfLink" to sendCodeInsteadOfLink,
                    "shortCode" to shortCode
                )
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

    fun validateSignInCode(
        email: String,
        shortCode: String,
        referral: String?
    ): ValidateSignInCodeResponse {
        val token = signInTokenDao.getSignInTokenFromEmailAndShortCode(email, shortCode)
            ?: throw BadRequestResponse("Invalid code.")
        val user = userDao.getUserByEmail(email)
        val redirect = if (user == null) {
            getRegistrationLink(token, referral, null)
        } else {
            getSignInLink(token, null)
        }

        return ValidateSignInCodeResponse(
            signInToken = token,
            isRegistration = user == null,
            redirect = redirect
        )
    }

    fun signIn(token: String): String {
        val email = signInTokenDao.getEmailFromSignInToken(token)
            ?: throw BadRequestResponse("Invalid sign-in token")
        signInTokenDao.deleteSignInToken(token)

        val user = userDao.getUserByEmail(email)
            ?: throw BadRequestResponse(
                "A user does not exist for the email attached to this token"
            )

        return createAuthTokenForUserId(user.id)
    }

    private fun getSignInLink(token: String, dest: String?): String {
        val linkSuffix = if (dest != null) {
            "&dest=$dest"
        } else {
            ""
        }

        return "$appUrl/sign-in?t=$token" + linkSuffix
    }

    private fun getRegistrationLink(token: String, referral: String?, dest: String?): String {
        val linkSuffix = if (dest != null) {
            "&dest=$dest"
        } else {
            ""
        }

        var link = "$appUrl/welcome/registration?t=$token" + linkSuffix

        if (referral != null) {
            link += "&referral=$referral"
        }

        return link
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
            throw FormValidationErrorResponse(
                listOf("name" to "This username has already been taken.")
            )
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
