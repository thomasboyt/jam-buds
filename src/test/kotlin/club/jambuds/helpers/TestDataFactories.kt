package club.jambuds.helpers

import club.jambuds.model.Post
import org.jdbi.v3.core.Handle

object TestDataFactories {
    fun createSongPost(txn: Handle, userId: Int, songId: Int): Post {
        return txn.createUpdate("""
                insert into posts (user_id, song_id) values (:userId, :songId)
                """.trimIndent())
            .bind("userId", userId)
            .bind("songId", songId)
            .executeAndReturnGeneratedKeys()
            .mapTo(Post::class.java)
            .one()
    }

    fun createSong(txn: Handle): Int {
        return txn.createUpdate("""
                insert into songs (title, artists) values (:title, :artist)
                """.trimIndent())
            .bind("title", "song")
            .bindArray("artist", String::class.java, listOf("song"))
            .executeAndReturnGeneratedKeys("id")
            .mapTo(Int::class.java)
            .one()
    }

    fun createUser(txn: Handle, name: String, showInFeed: Boolean): Int {
        return txn.createUpdate("""
                insert into users (name, show_in_public_feed) values (:name, :show_in_public_feed)
                """.trimIndent())
            .bind("name", name)
            .bind("show_in_public_feed", showInFeed)
            .executeAndReturnGeneratedKeys("id")
            .mapTo(Int::class.java)
            .one()
    }

    fun followUser(txn: Handle, userId: Int, followingId: Int): Int {
        return txn.createUpdate("""
                insert into following (user_id, following_id) values (:userId, :followingId)
                """.trimIndent())
            .bind("userId", userId)
            .bind("followingId", followingId)
            .execute()
    }

    fun createLike(txn: Handle, userId: Int, songId: Int): Int {
        return txn.createUpdate("""
                insert into likes (user_id, song_id) values (:userId, :songId)
                """.trimIndent())
            .bind("userId", userId)
            .bind("songId", songId)
            .execute()
    }
}
