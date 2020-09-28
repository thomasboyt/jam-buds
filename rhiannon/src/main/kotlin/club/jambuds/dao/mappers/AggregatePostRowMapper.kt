package club.jambuds.dao.mappers

import club.jambuds.model.AggregatedPost
import club.jambuds.model.AggregatedPostItem
import com.google.gson.GsonBuilder
import com.google.gson.TypeAdapter
import com.google.gson.stream.JsonReader
import com.google.gson.stream.JsonWriter
import org.jdbi.v3.core.mapper.RowMapper
import org.jdbi.v3.core.statement.StatementContext
import java.sql.ResultSet
import java.time.Instant
import java.time.ZonedDateTime

/**
 * Aggregate posts collect the individual posts into a JSON aggregate array, which gets parsed here.
 * This may all be replaced with something more "elegant" in the future - e.g. some sort of
 * self-join, perhaps.
 */
class AggregatedPostRowMapper : RowMapper<AggregatedPost> {
    override fun map(rs: ResultSet, ctx: StatementContext): AggregatedPost {
        val postsJson = rs.getString("agg_posts")

        val gson = GsonBuilder()
            .registerTypeAdapter(Instant::class.java, ZonedTsToInstantTypeAdapter())
            .create()

        val posts = gson.fromJson(postsJson, Array<AggregatedPostItem>::class.java).toList()

        return AggregatedPost(
            // lmao resultset is a terrible api
            songId = rs.getObject("song_id") as Int?,
            mixtapeId = rs.getObject("mixtape_id") as Int?,
            timestamp = rs.getTimestamp("agg_timestamp").toInstant(),
            posts = posts
        )
    }

    /**
     * Casts a Postgres JSONB-serialized timestamp-with-timezone to an Instant
     */
    private class ZonedTsToInstantTypeAdapter : TypeAdapter<Instant>() {
        override fun read(input: JsonReader): Instant {
            return ZonedDateTime.parse(input.nextString()).toInstant()
        }

        override fun write(out: JsonWriter, value: Instant?) = throw NotImplementedError()
    }
}
