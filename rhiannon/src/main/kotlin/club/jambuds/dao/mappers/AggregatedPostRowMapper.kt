package club.jambuds.dao.mappers

import club.jambuds.model.AggregatedPost
import club.jambuds.model.AggregatedPostItem
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.KotlinModule
import org.jdbi.v3.core.mapper.RowMapper
import org.jdbi.v3.core.statement.StatementContext
import java.sql.ResultSet

/**
 * Aggregate posts collect the individual posts into a JSON aggregate array, which gets parsed here.
 * This may all be replaced with something more "elegant" in the future - e.g. some sort of
 * self-join, perhaps.
 */
class AggregatedPostRowMapper : RowMapper<AggregatedPost> {
    override fun map(rs: ResultSet, ctx: StatementContext): AggregatedPost {
        val postsJson = rs.getString("agg_posts")

        val mapper = ObjectMapper()
            .registerModule(KotlinModule())
            .registerModule(JavaTimeModule())

        val posts = mapper.readValue(postsJson, Array<AggregatedPostItem>::class.java).toList()

        return AggregatedPost(
            // lmao resultset is a terrible api
            songId = rs.getObject("song_id") as Int?,
            mixtapeId = rs.getObject("mixtape_id") as Int?,
            albumId = rs.getObject("album_id") as Int?,
            timestamp = rs.getTimestamp("agg_timestamp").toInstant(),
            posts = posts
        )
    }
}
