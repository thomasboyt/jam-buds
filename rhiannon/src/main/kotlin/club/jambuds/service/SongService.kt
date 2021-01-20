package club.jambuds.service

import club.jambuds.dao.SongDao
import club.jambuds.model.User
import io.javalin.http.NotFoundResponse

class SongService(private val songDao: SongDao) {
    fun markSongListened(currentUser: User, songId: Int) {
        val userId = currentUser.id
        if (!songDao.getSongExistsById(songId)) {
            throw NotFoundResponse("Cannot find song with ID $songId")
        }
        if (songDao.hasSongListenedEntry(userId = userId, songId = songId)) {
            return
        }
        songDao.createSongListenedEntry(userId = userId, songId = songId)
    }

    fun unmarkSongListened(currentUser: User, songId: Int) {
        val userId = currentUser.id
        if (!songDao.hasSongListenedEntry(userId = userId, songId = songId)) {
            return
        }
        songDao.deleteSongListenedEntry(userId = userId, songId = songId)
    }
}
