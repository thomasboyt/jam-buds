package club.jambuds.responses

import club.jambuds.model.ItemSource

data class AlbumSearchResult(
    val title: String,
    val artists: List<String>,
    val albumArt: String,
    val source: ItemSource,
    val key: String
)
