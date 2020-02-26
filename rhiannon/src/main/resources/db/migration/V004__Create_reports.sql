CREATE TABLE public.post_reports (
    id SERIAL,
    created_at timestamp DEFAULT clock_timestamp() NOT NULL,
    reporter_user_id integer REFERENCES users (id) ON DELETE CASCADE NOT NULL,
    post_id integer REFERENCES posts (id) ON DELETE CASCADE NOT NULL
)