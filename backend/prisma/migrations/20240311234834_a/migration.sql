-- CreateTable
CREATE TABLE "inscriptions" (
    "inscription_id" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255),
    "content_length" INTEGER,
    "content_type" VARCHAR(255),
    "content_type_type" VARCHAR(255) NOT NULL,
    "genesis_fee" BIGINT,
    "genesis_height" INTEGER,
    "inscription_number" INTEGER,
    "next" VARCHAR(255),
    "output_value" BIGINT,
    "parent" VARCHAR(255),
    "previous" VARCHAR(255),
    "processed" BOOLEAN DEFAULT false,
    "nsfw" BOOLEAN DEFAULT false,
    "rune" VARCHAR(255),
    "sat" VARCHAR(255),
    "satpoint" VARCHAR(255),
    "timestamp" TIMESTAMP(6),
    "charms" TEXT[],
    "children" TEXT[],

    CONSTRAINT "inscriptions_pkey" PRIMARY KEY ("inscription_id","content_type_type")
);

-- CreateTable
CREATE TABLE "update_progress" (
    "progress_key" VARCHAR(255) NOT NULL,
    "last_processed_block" INTEGER,
    "last_processed_page" INTEGER,

    CONSTRAINT "update_progress_pkey" PRIMARY KEY ("progress_key")
);


CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_inscriptions_video" AS SELECT * FROM "inscriptions" WHERE "content_type_type" = 'video';
CREATE UNIQUE INDEX IF NOT EXISTS "mv_inscriptions_video_pkey" ON "mv_inscriptions_video"("inscription_id","content_type_type");
CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_inscriptions_audio" AS SELECT * FROM "inscriptions" WHERE "content_type_type" = 'audio';
CREATE UNIQUE INDEX IF NOT EXISTS "mv_inscriptions_audio_pkey" ON "mv_inscriptions_audio"("inscription_id","content_type_type");