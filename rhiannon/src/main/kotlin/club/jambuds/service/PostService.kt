package club.jambuds.service

import club.jambuds.dao.PostDao
import club.jambuds.model.Album
import club.jambuds.model.ItemType
import club.jambuds.model.SongWithMeta
import club.jambuds.model.User
import club.jambuds.model.ItemSource
import io.javalin.http.BadRequestResponse
import io.javalin.http.NotFoundResponse
import io.javalin.http.UnauthorizedResponse

class PostService(
    private val postDao: PostDao,
    private val searchService: SearchService,
    private val twitterService: TwitterService,
    private val appUrl: String
) {
    fun createPostForSong(
        currentUser: User,
        source: ItemSource,
        key: String,
        noteText: String?,
        postTweet: Boolean
    ): SongWithMeta {
        val song = searchService.getOrCreateSong(source, key, currentUser)

        val existingPost = postDao.getUserPostForItem(
            userId = currentUser.id,
            itemType = ItemType.SONG,
            itemId = song.id
        )
        if (existingPost != null) {
            throw BadRequestResponse("You have already posted this song")
        }

        postDao.createPost(
            userId = currentUser.id,
            itemType = ItemType.SONG,
            itemId = song.id,
            note = noteText
        )

        if (postTweet) {
            val tweetContent = getTweetContent(currentUser, ItemType.SONG, song.id, noteText)
            twitterService.postTweet(currentUser, tweetContent)
        }

        return song
    }

    fun createPostForAlbum(
        currentUser: User,
        source: ItemSource,
        key: String,
        noteText: String?,
        postTweet: Boolean
    ): Album {
        val album = searchService.getOrCreateAlbum(source, key, currentUser)
        val existingPost = postDao.getUserPostForItem(
            userId = currentUser.id,
            itemType = ItemType.ALBUM,
            itemId = album.id
        )
        if (existingPost != null) {
            throw BadRequestResponse("You have already posted this song")
        }

        postDao.createPost(
            userId = currentUser.id,
            itemType = ItemType.ALBUM,
            itemId = album.id,
            note = noteText
        )

        if (postTweet) {
            val tweetContent = getTweetContent(currentUser, ItemType.ALBUM, album.id, noteText)
            twitterService.postTweet(currentUser, tweetContent)
        }

        return album
    }

    fun deletePost(currentUser: User, postId: Int) {
        val post = postDao.getPostById(postId)
            ?: throw NotFoundResponse("No post found with id $postId")

        if (post.userId != currentUser.id) {
            throw UnauthorizedResponse("Cannot delete someone else's post")
        }

        postDao.deletePostById(postId)
    }

    private fun getTweetContent(
        currentUser: User,
        itemType: ItemType,
        itemId: Int,
        noteText: String?
    ): String {
        val itemTypeParam = itemType.type
        val tweetLink = "$appUrl/users/${currentUser.name}?$itemTypeParam=$itemId"

        return if (noteText == null) {
            "I just posted a new jam to Jam Buds! $tweetLink"
        } else {
            val noteContent = truncateNoteForTweet(noteText)
            "$noteContent $tweetLink"
        }
    }

    private fun truncateNoteForTweet(text: String): String {
        val tweetLength = 280
        val twitterUrlLength = 23
        val maxTextLength = tweetLength - twitterUrlLength - 1 // 1 for space between url and note
        if (text.length <= maxTextLength) {
            return text
        }

        val truncatedText = text.slice(0..(maxTextLength - 3)) // subtract three for ellipsis
        return "$truncatedText..."
    }
}
