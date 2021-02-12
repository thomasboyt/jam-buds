ALTER TABLE sign_in_tokens ADD COLUMN "short_code" VARCHAR(6);
CREATE INDEX sign_in_tokens_email_short_code_index ON public.sign_in_tokens USING btree (email, short_code);
