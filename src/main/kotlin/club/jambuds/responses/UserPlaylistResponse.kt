package club.jambuds.responses

import com.google.gson.annotations.Expose

data class UserPlaylistResponse(
    @Expose val items: List<UserPlaylistEntry>,
    @Expose val limit: Int,
    @Expose val userProfile: UserProfile
)

/*
to figure out:
- how should responses be defined?
- should responses be returned from services?
- is the service layer even useful? how would it compare to e.g. go usage
- if services return responses, can we distinguish "root response" (pass
  to ctx.json()) from "part of a response"
 */
