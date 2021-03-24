package club.jambuds.responses

import club.jambuds.model.ItemSource

data class SongSearchResult(
    val title: String,
    val album: String,
    val artists: List<String>,
    val albumArt: String,
    val source: ItemSource,
    val key: String
)
