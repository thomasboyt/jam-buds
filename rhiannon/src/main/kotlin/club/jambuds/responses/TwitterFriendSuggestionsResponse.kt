package club.jambuds.responses

import com.google.gson.annotations.Expose

data class TwitterFriendSuggestionsResponse(
    @Expose val users: List<PublicUserWithTwitterName>
)
