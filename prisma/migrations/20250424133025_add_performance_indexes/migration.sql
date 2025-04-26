-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_speciesId_idx" ON "Comment"("speciesId");

-- CreateIndex
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");

-- CreateIndex
CREATE INDEX "Image_speciesId_idx" ON "Image"("speciesId");

-- CreateIndex
CREATE INDEX "Species_categoryId_idx" ON "Species"("categoryId");

-- CreateIndex
CREATE INDEX "Species_isFeatured_idx" ON "Species"("isFeatured");

-- CreateIndex
CREATE INDEX "Species_name_idx" ON "Species"("name");

-- CreateIndex
CREATE INDEX "Species_createdAt_idx" ON "Species"("createdAt");
