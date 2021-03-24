package club.jambuds.util

object FuzzySearchLogic {
    fun cleanAlbumTitle(title: String): String {
        // remove parentheticals containing these words
        val regex = """\(.*(Remaster|Deluxe|Collector).*\)""".toRegex()
        return title.replace(regex, "")
    }

    fun albumTitleMatchExact(expected: String, result: String): Boolean {
        return result.equals(expected, ignoreCase = true)
    }

    fun albumTitleMatchLoose(expected: String, result: String): Boolean {
        // idea here is to allow e.g. matching "Foo" to "Foo (2012 Remaster)" or whatever
        // may want to use cleanAlbumTitle() on result rather than use contains()...
        return result.contains(expected, ignoreCase = true)
    }

    fun artistsMatch(expected: List<String>, result: List<String>): Boolean {
        // TODO: support matching
        // ["David Byrne & St Vincent"] == ["David Byrne", "St Vincent"]
        // split on "&", ",", "and", "/", "feat." ...
        val expectedSet = expected.map { it.toLowerCase() }.toSet()
        val resultSet = result.map { it.toLowerCase() }.toSet()
        return expectedSet == resultSet
    }
}
