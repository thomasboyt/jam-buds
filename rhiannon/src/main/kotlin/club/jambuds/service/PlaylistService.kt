package club.jambuds.service

import club.jambuds.dao.AlbumDao
import club.jambuds.dao.LikeDao
import club.jambuds.dao.MixtapeDao
import club.jambuds.dao.PostDao
import club.jambuds.dao.SongDao
import club.jambuds.model.AggregatedPost
import club.jambuds.model.Album
import club.jambuds.model.ItemType
import club.jambuds.model.MixtapePreview
import club.jambuds.model.PlaylistPost
import club.jambuds.model.Post
import club.jambuds.model.SongWithMeta
import club.jambuds.responses.FeedPlaylistEntry
import club.jambuds.responses.FeedPlaylistPost
import club.jambuds.responses.PlaylistEntry
import club.jambuds.responses.UserPlaylistEntry
import java.time.Instant

class PlaylistService(
    private val postDao: PostDao,
    private val songDao: SongDao,
    private val mixtapeDao: MixtapeDao,
    private val albumDao: AlbumDao,
    private val likeDao: LikeDao
) {
    private val defaultPlaylistLimit = 20

    data class Playlist<T : PlaylistEntry>(
        val items: List<T>,
        val limit: Int
    )

    fun getUserFeed(
        currentUserId: Int,
        beforeTimestamp: Instant?,
        afterTimestamp: Instant?,
        limit: Int = defaultPlaylistLimit
    ): Playlist<FeedPlaylistEntry> {
        val posts = postDao.getAggregatedPostsByUserFeed(
            currentUserId = currentUserId,
            beforeTimestamp = beforeTimestamp,
            afterTimestamp = afterTimestamp,
            limit = limit
        )

        val items = getFeedEntriesForAggregatedPosts(posts, currentUserId)
        return Playlist(items = items, limit = limit)
    }

    fun getPublicFeed(
        beforeTimestamp: Instant?,
        afterTimestamp: Instant?,
        currentUserId: Int?,
        limit: Int = defaultPlaylistLimit
    ): Playlist<FeedPlaylistEntry> {
        val posts = postDao.getPublicAggregatedPosts(
            beforeTimestamp = beforeTimestamp,
            afterTimestamp = afterTimestamp,
            limit = limit
        )

        val items = getFeedEntriesForAggregatedPosts(posts, currentUserId, includeNotes = false)
        return Playlist(items = items, limit = limit)
    }

    fun getUserPlaylist(
        userId: Int,
        currentUserId: Int?,
        onlyMixtapes: Boolean,
        beforeTimestamp: Instant?,
        afterTimestamp: Instant?,
        limit: Int = defaultPlaylistLimit
    ): Playlist<UserPlaylistEntry> {
        val posts = postDao.getPostsForUserPlaylist(
            userId = userId,
            beforeTimestamp = beforeTimestamp,
            afterTimestamp = afterTimestamp,
            onlyMixtapes = onlyMixtapes,
            limit = limit
        )

        val items = getUserPlaylistEntriesForPosts(posts, currentUserId)
        return Playlist(items = items, limit = limit)
    }

    fun getUserLikesPlaylist(
        userId: Int,
        currentUserId: Int?,
        beforeTimestamp: Instant?,
        afterTimestamp: Instant?,
        limit: Int = defaultPlaylistLimit
    ): Playlist<UserPlaylistEntry> {
        val likes = likeDao.getLikesForUser(
            userId = userId,
            beforeTimestamp = beforeTimestamp,
            afterTimestamp = afterTimestamp,
            limit = limit
        )

        val items = getUserPlaylistEntriesForPosts(likes, currentUserId)
        return Playlist(items = items, limit = limit)
    }

    // TODO: is there any way to collapse the two below? you can in TypeScript using overrides
    // but not sure if there's a good way to do it in Kotlin where there's somewhat more
    // type soundness

    private fun getFeedEntriesForAggregatedPosts(
        posts: List<AggregatedPost>,
        currentUserId: Int?,
        includeNotes: Boolean = true
    ): List<FeedPlaylistEntry> {
        val songsMap = getSongsMap(posts, currentUserId)
        val mixtapesMap = getMixtapesMap(posts, currentUserId)
        val albumsMap = getAlbumsMap(posts, currentUserId)

        return posts.map {
            FeedPlaylistEntry(
                timestamp = it.timestamp,
                song = songsMap[it.songId],
                mixtape = mixtapesMap[it.mixtapeId],
                album = albumsMap[it.albumId],
                type = getPostType(it),
                posts = getDeaggregatedPosts(it, includeNotes = includeNotes)
            )
        }
    }

    private fun getDeaggregatedPosts(
        aggregatedPost: AggregatedPost,
        includeNotes: Boolean
    ): List<FeedPlaylistPost> {
        return aggregatedPost.posts.map { post ->
            FeedPlaylistPost(
                postId = post.id,
                userName = post.userName,
                noteText = if (includeNotes) post.note else null,
                timestamp = post.createdAt
            )
        }
    }

    private fun getUserPlaylistEntriesForPosts(
        posts: List<PlaylistPost>,
        currentUserId: Int?
    ): List<UserPlaylistEntry> {
        val songsMap = getSongsMap(posts, currentUserId)
        val mixtapesMap = getMixtapesMap(posts, currentUserId)
        val albumsMap = getAlbumsMap(posts, currentUserId)

        return posts.map {
            UserPlaylistEntry(
                timestamp = it.timestamp,
                song = songsMap[it.songId],
                mixtape = mixtapesMap[it.mixtapeId],
                album = albumsMap[it.albumId],
                type = getPostType(it),
                postId = if (it is Post) it.id else null,
                noteText = if (it is Post) it.note else null
            )
        }
    }

    private fun getSongsMap(
        posts: List<PlaylistPost>,
        currentUserId: Int?
    ): Map<Int, SongWithMeta> {
        val songIds = posts.mapNotNull { it.songId }
        return if (songIds.isNotEmpty()) {
            val currentUserId = currentUserId ?: -1
            val songsList = songDao.getSongsByIds(songIds, currentUserId)
            songsList.map { it.id to it }.toMap()
        } else {
            emptyMap()
        }
    }

    private fun getMixtapesMap(posts: List<PlaylistPost>, currentUserId: Int?): Map<Int, MixtapePreview> {
        val mixtapeIds = posts.mapNotNull { it.mixtapeId }
        return if (mixtapeIds.isNotEmpty()) {
            val mixtapesList = mixtapeDao.getMixtapePreviewsByIds(mixtapeIds, currentUserId)
            mixtapesList.map { it.id to it }.toMap()
        } else {
            emptyMap()
        }
    }

    private fun getAlbumsMap(posts: List<PlaylistPost>, currentUserId: Int?): Map<Int, Album> {
        val albumIds = posts.mapNotNull { it.albumId }
        return if (albumIds.isNotEmpty()) {
            val currentUserId = currentUserId ?: -1
            val albumsList = albumDao.getAlbumsByIds(albumIds, currentUserId)
            albumsList.map { it.id to it }.toMap()
        } else {
            emptyMap()
        }
    }

    private fun getPostType(post: PlaylistPost): ItemType {
        return when {
            post.songId != null -> ItemType.SONG
            post.mixtapeId != null -> ItemType.MIXTAPE
            post.albumId != null -> ItemType.ALBUM
            else -> throw Error("Could not match post ID to mixtape or song ID")
        }
    }
}
