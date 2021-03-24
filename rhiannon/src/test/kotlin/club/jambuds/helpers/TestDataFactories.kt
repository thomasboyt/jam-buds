package club.jambuds.helpers

import club.jambuds.model.Post
import club.jambuds.model.User
import club.jambuds.model.cache.SongSearchCache
import club.jambuds.util.generateRandomString
import com.wrapper.spotify.model_objects.specification.AlbumSimplified
import com.wrapper.spotify.model_objects.specification.ArtistSimplified
import com.wrapper.spotify.model_objects.specification.ExternalId
import com.wrapper.spotify.model_objects.specification.Image
import com.wrapper.spotify.model_objects.specification.Track
import org.jdbi.v3.core.Handle
import java.time.Instant

object TestDataFactories {
    fun createSongPost(txn: Handle, userId: Int, songId: Int, note: String? = null): Post {
        val query =
            """
            insert into posts (user_id, song_id, note) values (:userId, :songId, :note)
            """.trimIndent()

        return txn.createUpdate(query)
            .bind("userId", userId)
            .bind("songId", songId)
            .bind("note", note)
            .executeAndReturnGeneratedKeys()
            .mapTo(Post::class.java)
            .one()
    }

    fun createMixtapePost(txn: Handle, userId: Int, mixtapeId: Int): Post {
        val query =
            """
            insert into posts (user_id, mixtape_id) values (:userId, :mixtapeId)
            """.trimIndent()

        return txn.createUpdate(query)
            .bind("userId", userId)
            .bind("mixtapeId", mixtapeId)
            .executeAndReturnGeneratedKeys()
            .mapTo(Post::class.java)
            .one()
    }

    fun createSong(txn: Handle, spotifyId: String = "spotify_id"): Int {
        val query =
            """
            insert into songs (title, artists, spotify_id) values (:title, :artist, :spotifyId)
            """.trimIndent()

        return txn.createUpdate(query)
            .bind("title", "song")
            .bindArray("artist", String::class.java, listOf("song"))
            .bind("spotifyId", spotifyId)
            .executeAndReturnGeneratedKeys("id")
            .mapTo(Int::class.java)
            .one()
    }

    fun createUser(
        txn: Handle,
        name: String,
        showInFeed: Boolean,
        hasTwitter: Boolean = false
    ): User {
        val query =
            """
            insert into users (name, email, show_in_public_feed, twitter_id, twitter_name, twitter_token, twitter_secret)
                        values (:name, :email, :showInPublicFeed, :twitterId, :twitterName, :twitterAuthToken, :twitterAuthSecret)
            """.trimIndent()

        return txn.createUpdate(query)
            .bind("name", name)
            .bind("email", "$name@jambuds.club")
            .bind("showInPublicFeed", showInFeed)
            .bind("twitterId", if (hasTwitter) generateRandomString(16) else null)
            .bind("twitterName", if (hasTwitter) generateRandomString(16) else null)
            .bind("twitterAuthToken", if (hasTwitter) "token" else null)
            .bind("twitterAuthSecret", if (hasTwitter) "secret" else null)
            .executeAndReturnGeneratedKeys()
            .mapTo(User::class.java)
            .one()
    }

    fun followUser(txn: Handle, userId: Int, followingId: Int): Int {
        val query =
            """
            insert into following (user_id, following_id) values (:userId, :followingId)
            """.trimIndent()
        return txn.createUpdate(query)
            .bind("userId", userId)
            .bind("followingId", followingId)
            .execute()
    }

    fun createSongLike(txn: Handle, userId: Int, songId: Int): Int {
        val query =
            """
            insert into likes (user_id, song_id) values (:userId, :songId)
            """.trimIndent()
        return txn.createUpdate(query)
            .bind("userId", userId)
            .bind("songId", songId)
            .execute()
    }

    fun createMixtapeLike(txn: Handle, userId: Int, mixtapeId: Int): Int {
        val query =
            """
            insert into likes (user_id, mixtape_id) values (:userId, :mixtapeId)
            """.trimIndent()
        return txn.createUpdate(query)
            .bind("userId", userId)
            .bind("mixtapeId", mixtapeId)
            .execute()
    }

    fun createAuthToken(txn: Handle, userId: Int): String {
        val token = generateRandomString(16)
        val query =
            """
            insert into auth_tokens (user_id, auth_token) values (:userId, :authToken)
            """.trimIndent()
        txn.createUpdate(query)
            .bind("userId", userId)
            .bind("authToken", token)
            .execute()
        return token
    }

    fun createMixtape(txn: Handle, userId: Int, isPublished: Boolean): Int {
        val query =
            """
            insert into mixtapes (user_id, title,  slug,   published_at)
                         values  (:userId, :title, :slug, :publishedAt)
            """.trimIndent()

        val publishedAt = if (isPublished) {
            Instant.now()
        } else {
            null
        }

        return txn.createUpdate(query)
            .bind("userId", userId)
            .bind("title", "title")
            .bind("slug", "title")
            .bind("publishedAt", publishedAt)
            .executeAndReturnGeneratedKeys("id")
            .mapTo(Int::class.java)
            .one()
    }

    fun addSongToMixtape(txn: Handle, mixtapeId: Int, songId: Int, rank: Int) {
        val query =
            """
            insert into mixtape_song_entries (mixtape_id, song_id, rank)
                        values               (:mixtapeId, :songId, :rank)
            """.trimIndent()

        txn.createUpdate(query)
            .bind("mixtapeId", mixtapeId)
            .bind("songId", songId)
            .bind("rank", rank)
            .execute()
    }

    fun createSpotifyTrack(isrc: String? = "abcde"): Track {
        return Track.Builder()
            .setId("abcde")
            .setName("Live Like We're Dancing")
            .setArtists(
                ArtistSimplified.Builder().setName("Mura Masa").build(),
                ArtistSimplified.Builder().setName("Georgia").build()
            )
            .setAlbum(
                AlbumSimplified.Builder()
                    .setName("R.Y.C")
                    .setImages(Image.Builder().setUrl("/some/image.jpg").build())
                    .build()
            )
            .setExternalIds(
                ExternalId.Builder().setExternalIds(mapOf("isrc" to isrc)).build()
            )
            .build()
    }

    fun createPartialSongSearchCacheEntry(): SongSearchCache {
        return SongSearchCache(
            title = "Live Like We're Dancing",
            artists = listOf("Mura Masa", "Georgia"),
            album = "R.Y.C",
            albumArt = "/some/image.jpg",
            searchedSpotify = true,
            spotifyId = "abcdef",
            isrc = "efghijk",
            searchedAppleMusic = false,
            appleMusicUrl = null,
            appleMusicId = null,
            searchedBandcamp = false,
            bandcampId = null,
            bandcampUrl = null,
            bandcampStreamingAvailable = null
        )
    }

    fun createFullSongSearchCacheEntry(): SongSearchCache {
        return createPartialSongSearchCacheEntry().copy(
            searchedAppleMusic = true
        )
    }

    fun createBandcampSongSearchCacheEntry(): SongSearchCache {
        return createPartialSongSearchCacheEntry().copy(
            spotifyId = null,
            searchedSpotify = false,
            searchedBandcamp = true,
            bandcampId = "abcdef",
            bandcampUrl = "https://artist.bandcamp.com/track/title",
            bandcampStreamingAvailable = true
        )
    }
}
