-- RenameTables
ALTER TABLE "Account" RENAME TO "accounts";
ALTER TABLE "Session" RENAME TO "sessions";
ALTER TABLE "VerificationToken" RENAME TO "verification_tokens";
ALTER TABLE "User" RENAME TO "users";
ALTER TABLE "Item" RENAME TO "items";
ALTER TABLE "ItemType" RENAME TO "item_types";
ALTER TABLE "Collection" RENAME TO "collections";
ALTER TABLE "Tag" RENAME TO "tags";
ALTER TABLE "ItemTag" RENAME TO "item_tags";

-- RenameColumns: accounts
ALTER TABLE "accounts" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "accounts" RENAME COLUMN "providerAccountId" TO "provider_account_id";

-- RenameColumns: sessions
ALTER TABLE "sessions" RENAME COLUMN "sessionToken" TO "session_token";
ALTER TABLE "sessions" RENAME COLUMN "userId" TO "user_id";

-- RenameColumns: users
ALTER TABLE "users" RENAME COLUMN "emailVerified" TO "email_verified";
ALTER TABLE "users" RENAME COLUMN "isPro" TO "is_pro";
ALTER TABLE "users" RENAME COLUMN "stripeCustomerId" TO "stripe_customer_id";
ALTER TABLE "users" RENAME COLUMN "stripeSubscriptionId" TO "stripe_subscription_id";
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";

-- RenameColumns: items
ALTER TABLE "items" RENAME COLUMN "contentType" TO "content_type";
ALTER TABLE "items" RENAME COLUMN "fileUrl" TO "file_url";
ALTER TABLE "items" RENAME COLUMN "fileName" TO "file_name";
ALTER TABLE "items" RENAME COLUMN "fileSize" TO "file_size";
ALTER TABLE "items" RENAME COLUMN "isFavorite" TO "is_favorite";
ALTER TABLE "items" RENAME COLUMN "isPinned" TO "is_pinned";
ALTER TABLE "items" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "items" RENAME COLUMN "typeId" TO "type_id";
ALTER TABLE "items" RENAME COLUMN "collectionId" TO "collection_id";
ALTER TABLE "items" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "items" RENAME COLUMN "updatedAt" TO "updated_at";

-- RenameColumns: item_types
ALTER TABLE "item_types" RENAME COLUMN "isSystem" TO "is_system";
ALTER TABLE "item_types" RENAME COLUMN "userId" TO "user_id";

-- RenameColumns: collections
ALTER TABLE "collections" RENAME COLUMN "isFavorite" TO "is_favorite";
ALTER TABLE "collections" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "collections" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "collections" RENAME COLUMN "updatedAt" TO "updated_at";

-- RenameColumns: tags
ALTER TABLE "tags" RENAME COLUMN "userId" TO "user_id";

-- RenameColumns: item_tags
ALTER TABLE "item_tags" RENAME COLUMN "itemId" TO "item_id";
ALTER TABLE "item_tags" RENAME COLUMN "tagId" TO "tag_id";
