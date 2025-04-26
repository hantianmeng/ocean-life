-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Comment" ("content", "createdAt", "id", "speciesId", "updatedAt", "userId") SELECT "content", "createdAt", "id", "speciesId", "updatedAt", "userId" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");
CREATE INDEX "Comment_speciesId_idx" ON "Comment"("speciesId");
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "speciesId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Image" ("caption", "createdAt", "id", "speciesId", "updatedAt", "url") SELECT "caption", "createdAt", "id", "speciesId", "updatedAt", "url" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE INDEX "Image_speciesId_idx" ON "Image"("speciesId");
CREATE INDEX "Image_createdAt_idx" ON "Image"("createdAt");
CREATE TABLE "new_Species" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "foreignName" TEXT,
    "protectionLevel" TEXT,
    "description" TEXT,
    "habitat" TEXT,
    "distribution" TEXT,
    "altitude" TEXT,
    "habits" TEXT,
    "reproduction" TEXT,
    "isEdible" BOOLEAN NOT NULL DEFAULT false,
    "cookingMethods" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Species" ("altitude", "categoryId", "cookingMethods", "createdAt", "description", "distribution", "foreignName", "habitat", "habits", "id", "isEdible", "isFeatured", "name", "protectionLevel", "reproduction", "scientificName", "updatedAt") SELECT "altitude", "categoryId", "cookingMethods", "createdAt", "description", "distribution", "foreignName", "habitat", "habits", "id", "isEdible", "isFeatured", "name", "protectionLevel", "reproduction", "scientificName", "updatedAt" FROM "Species";
DROP TABLE "Species";
ALTER TABLE "new_Species" RENAME TO "Species";
CREATE UNIQUE INDEX "Species_scientificName_key" ON "Species"("scientificName");
CREATE INDEX "Species_categoryId_idx" ON "Species"("categoryId");
CREATE INDEX "Species_isFeatured_idx" ON "Species"("isFeatured");
CREATE INDEX "Species_name_idx" ON "Species"("name");
CREATE INDEX "Species_createdAt_idx" ON "Species"("createdAt");
CREATE INDEX "Species_scientificName_idx" ON "Species"("scientificName");
CREATE INDEX "Species_protectionLevel_idx" ON "Species"("protectionLevel");
CREATE INDEX "Species_isEdible_idx" ON "Species"("isEdible");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Category_createdAt_idx" ON "Category"("createdAt");

-- CreateIndex
CREATE INDEX "Setting_key_idx" ON "Setting"("key");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
