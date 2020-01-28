select auth_token, users.*
from auth_tokens
join users on users.id = auth_tokens.user_id
where auth_token = ${authToken};