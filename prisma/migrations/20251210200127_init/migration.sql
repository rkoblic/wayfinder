-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idea_seeds" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idea_seeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nodes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "seed_id" TEXT,
    "concept" TEXT NOT NULL,
    "generated_via" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lateral_links" (
    "id" TEXT NOT NULL,
    "from_node" TEXT NOT NULL,
    "to_node" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lateral_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "micro_discoveries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "node_id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "micro_discoveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reflections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "node_id" TEXT NOT NULL,
    "surprise" TEXT,
    "tag" TEXT NOT NULL,
    "metaphor" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reflections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "self_narratives" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "narrative" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "self_narratives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idea_seeds_user_id_created_at_idx" ON "idea_seeds"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "nodes_user_id_created_at_idx" ON "nodes"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "lateral_links_from_node_idx" ON "lateral_links"("from_node");

-- CreateIndex
CREATE INDEX "lateral_links_to_node_idx" ON "lateral_links"("to_node");

-- CreateIndex
CREATE INDEX "micro_discoveries_user_id_created_at_idx" ON "micro_discoveries"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "reflections_user_id_tag_idx" ON "reflections"("user_id", "tag");

-- CreateIndex
CREATE INDEX "self_narratives_user_id_created_at_idx" ON "self_narratives"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "idea_seeds" ADD CONSTRAINT "idea_seeds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_seed_id_fkey" FOREIGN KEY ("seed_id") REFERENCES "idea_seeds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lateral_links" ADD CONSTRAINT "lateral_links_from_node_fkey" FOREIGN KEY ("from_node") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lateral_links" ADD CONSTRAINT "lateral_links_to_node_fkey" FOREIGN KEY ("to_node") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "micro_discoveries" ADD CONSTRAINT "micro_discoveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "micro_discoveries" ADD CONSTRAINT "micro_discoveries_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reflections" ADD CONSTRAINT "reflections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reflections" ADD CONSTRAINT "reflections_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "self_narratives" ADD CONSTRAINT "self_narratives_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
