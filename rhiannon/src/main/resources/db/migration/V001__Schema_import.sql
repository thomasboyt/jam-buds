--
-- PostgreSQL database dump
--

--
-- Name: notification_types; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification_types AS ENUM (
    'like',
    'follow',
    'joined',
    'system'
);


ALTER TYPE public.notification_types OWNER TO postgres;

--
-- Name: anonymous_spotify_credentials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.anonymous_spotify_credentials (
    anon_user_token character varying(255),
    access_token character varying(255),
    refresh_token character varying(255),
    expires_at timestamp without time zone
);


ALTER TABLE public.anonymous_spotify_credentials OWNER TO postgres;

--
-- Name: auth_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_tokens (
    auth_token character varying(255) NOT NULL,
    user_id integer
);


ALTER TABLE public.auth_tokens OWNER TO postgres;

--
-- Name: color_schemes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.color_schemes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    text_color character varying(255) NOT NULL,
    background_gradient_name character varying(255)
);


ALTER TABLE public.color_schemes OWNER TO postgres;

--
-- Name: color_schemes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.color_schemes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.color_schemes_id_seq OWNER TO postgres;

--
-- Name: color_schemes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.color_schemes_id_seq OWNED BY public.color_schemes.id;


--
-- Name: following; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.following (
    user_id integer,
    following_id integer
);


ALTER TABLE public.following OWNER TO postgres;

--
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.likes (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id integer,
    song_id integer NOT NULL
);


ALTER TABLE public.likes OWNER TO postgres;

--
-- Name: likes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.likes_id_seq OWNER TO postgres;

--
-- Name: likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.likes_id_seq OWNED BY public.likes.id;


--
-- Name: mixtape_song_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mixtape_song_entries (
    mixtape_id integer NOT NULL,
    song_id integer NOT NULL,
    rank integer NOT NULL
);


ALTER TABLE public.mixtape_song_entries OWNER TO postgres;

--
-- Name: mixtapes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mixtapes (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL,
    published_at timestamp with time zone,
    slug character varying(255) NOT NULL
);


ALTER TABLE public.mixtapes OWNER TO postgres;

--
-- Name: mixtapes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mixtapes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mixtapes_id_seq OWNER TO postgres;

--
-- Name: mixtapes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mixtapes_id_seq OWNED BY public.mixtapes.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL,
    target_user_id integer NOT NULL,
    type public.notification_types,
    notification_user_id integer,
    notification_song_id integer,
    notification_system_message character varying(255),
    read boolean DEFAULT false
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL,
    song_id integer,
    user_id integer,
    mixtape_id integer
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.posts_id_seq OWNER TO postgres;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: sign_in_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sign_in_tokens (
    token character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sign_in_tokens OWNER TO postgres;

--
-- Name: songs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.songs (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    artists text[] NOT NULL,
    album character varying(255),
    title character varying(255) NOT NULL,
    spotify_id character varying(255),
    album_art character varying(255),
    isrc_id character varying(255),
    apple_music_id character varying(255),
    apple_music_url character varying(255)
);


ALTER TABLE public.songs OWNER TO postgres;

--
-- Name: songs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.songs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.songs_id_seq OWNER TO postgres;

--
-- Name: songs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.songs_id_seq OWNED BY public.songs.id;


--
-- Name: songs_users_listened; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.songs_users_listened (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    song_id integer,
    user_id integer
);


ALTER TABLE public.songs_users_listened OWNER TO postgres;

--
-- Name: songs_users_listened_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.songs_users_listened_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.songs_users_listened_id_seq OWNER TO postgres;

--
-- Name: songs_users_listened_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.songs_users_listened_id_seq OWNED BY public.songs_users_listened.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    twitter_name character varying(255),
    twitter_id character varying(255),
    twitter_token character varying(255),
    twitter_secret character varying(255),
    name character varying(255) NOT NULL,
    email character varying(255),
    spotify_access_token character varying(255),
    spotify_refresh_token character varying(255),
    spotify_expires_at timestamp without time zone,
    show_in_public_feed boolean
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: color_schemes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color_schemes ALTER COLUMN id SET DEFAULT nextval('public.color_schemes_id_seq'::regclass);


--
-- Name: likes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes ALTER COLUMN id SET DEFAULT nextval('public.likes_id_seq'::regclass);


--
-- Name: mixtapes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mixtapes ALTER COLUMN id SET DEFAULT nextval('public.mixtapes_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: songs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs ALTER COLUMN id SET DEFAULT nextval('public.songs_id_seq'::regclass);


--
-- Name: songs_users_listened id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs_users_listened ALTER COLUMN id SET DEFAULT nextval('public.songs_users_listened_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: color_schemes color_schemes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color_schemes
    ADD CONSTRAINT color_schemes_pkey PRIMARY KEY (id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: mixtapes mixtapes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mixtapes
    ADD CONSTRAINT mixtapes_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: songs songs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_pkey PRIMARY KEY (id);


--
-- Name: songs_users_listened songs_users_listened_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs_users_listened
    ADD CONSTRAINT songs_users_listened_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_twitter_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_twitter_id_unique UNIQUE (twitter_id);


--
-- Name: users users_twitter_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_twitter_name_unique UNIQUE (twitter_name);


--
-- Name: anonymous_spotify_credentials_anon_user_token_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX anonymous_spotify_credentials_anon_user_token_index ON public.anonymous_spotify_credentials USING btree (anon_user_token);


--
-- Name: auth_tokens_auth_token_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_tokens_auth_token_index ON public.auth_tokens USING btree (auth_token);


--
-- Name: auth_tokens_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_tokens_user_id_index ON public.auth_tokens USING btree (user_id);


--
-- Name: following_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX following_user_id_index ON public.following USING btree (user_id);


--
-- Name: likes_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX likes_user_id_index ON public.likes USING btree (user_id);


--
-- Name: likes_user_id_song_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX likes_user_id_song_id_index ON public.likes USING btree (user_id, song_id);


--
-- Name: posts_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_user_id_index ON public.posts USING btree (user_id);


--
-- Name: sign_in_tokens_email_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sign_in_tokens_email_index ON public.sign_in_tokens USING btree (email);


--
-- Name: sign_in_tokens_token_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sign_in_tokens_token_index ON public.sign_in_tokens USING btree (token);


--
-- Name: songs_spotify_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX songs_spotify_id_index ON public.songs USING btree (spotify_id);


--
-- Name: songs_users_listened_user_id_song_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX songs_users_listened_user_id_song_id_index ON public.songs_users_listened USING btree (user_id, song_id);


--
-- Name: users_email_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_index ON public.users USING btree (email);


--
-- Name: users_twitter_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_twitter_id_index ON public.users USING btree (twitter_id);


--
-- Name: users_twitter_name_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_twitter_name_index ON public.users USING btree (twitter_name);


--
-- Name: auth_tokens auth_tokens_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_tokens
    ADD CONSTRAINT auth_tokens_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: color_schemes color_schemes_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color_schemes
    ADD CONSTRAINT color_schemes_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: following following_following_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.following
    ADD CONSTRAINT following_following_id_foreign FOREIGN KEY (following_id) REFERENCES public.users(id);


--
-- Name: following following_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.following
    ADD CONSTRAINT following_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: likes likes_song_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_song_id_foreign FOREIGN KEY (song_id) REFERENCES public.songs(id);


--
-- Name: likes likes_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: mixtape_song_entries mixtape_song_entries_mixtape_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mixtape_song_entries
    ADD CONSTRAINT mixtape_song_entries_mixtape_id_foreign FOREIGN KEY (mixtape_id) REFERENCES public.mixtapes(id) ON DELETE CASCADE;


--
-- Name: mixtape_song_entries mixtape_song_entries_song_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mixtape_song_entries
    ADD CONSTRAINT mixtape_song_entries_song_id_foreign FOREIGN KEY (song_id) REFERENCES public.songs(id) ON DELETE CASCADE;


--
-- Name: mixtapes mixtapes_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mixtapes
    ADD CONSTRAINT mixtapes_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_notification_song_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_notification_song_id_foreign FOREIGN KEY (notification_song_id) REFERENCES public.songs(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_notification_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_notification_user_id_foreign FOREIGN KEY (notification_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_target_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_target_user_id_foreign FOREIGN KEY (target_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: posts posts_mixtape_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_mixtape_id_foreign FOREIGN KEY (mixtape_id) REFERENCES public.mixtapes(id) ON DELETE CASCADE;


--
-- Name: posts posts_song_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_song_id_foreign FOREIGN KEY (song_id) REFERENCES public.songs(id);


--
-- Name: posts posts_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: songs_users_listened songs_users_listened_song_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs_users_listened
    ADD CONSTRAINT songs_users_listened_song_id_foreign FOREIGN KEY (song_id) REFERENCES public.songs(id);


--
-- Name: songs_users_listened songs_users_listened_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs_users_listened
    ADD CONSTRAINT songs_users_listened_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

