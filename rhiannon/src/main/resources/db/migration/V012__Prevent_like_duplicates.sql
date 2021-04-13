DROP INDEX "public"."likes_user_id_song_id_index";
CREATE UNIQUE INDEX "likes_user_id_song_id_index" ON "public"."likes" USING BTREE ("user_id","song_id");
CREATE UNIQUE INDEX "likes_user_id_album_id_index" ON "public"."likes" USING BTREE ("user_id","album_id");
CREATE UNIQUE INDEX "likes_user_id_mixtape_id_index" ON "public"."likes" USING BTREE ("user_id","mixtape_id");
