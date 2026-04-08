ALTER TABLE "api_keys" RENAME COLUMN "key" TO "key_hash";--> statement-breakpoint
ALTER TABLE "api_keys" DROP CONSTRAINT "api_keys_key_unique";--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash");