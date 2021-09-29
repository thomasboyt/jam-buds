package club.jambuds.service

import club.jambuds.dao.PostDao
import club.jambuds.dao.ReportDao
import club.jambuds.model.User
import io.javalin.http.NotFoundResponse

class ReportService(
    private val adminNotifyService: AdminNotifyService,
    private val reportDao: ReportDao,
    private val postDao: PostDao
) {
    fun createPostReport(currentUser: User, postId: Int) {
        if (!postDao.getPostExistsById(postId)) {
            throw NotFoundResponse("No post exists with ID $postId")
        }

        if (reportDao.getReportExists(reporterUserId = currentUser.id, postId = postId)) {
            return
        }

        reportDao.createReport(reporterUserId = currentUser.id, postId = postId)

        adminNotifyService.notifyReport(fromUser = currentUser, postId = postId)
    }
}
