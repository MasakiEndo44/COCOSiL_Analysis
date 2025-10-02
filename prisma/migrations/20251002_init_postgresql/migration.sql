-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnosis_records" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "zodiac" TEXT NOT NULL,
    "animal" TEXT NOT NULL,
    "orientation" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "mbti" TEXT NOT NULL,
    "mainTaiheki" INTEGER NOT NULL,
    "subTaiheki" INTEGER,
    "sixStar" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "advice" TEXT NOT NULL,
    "satisfaction" INTEGER NOT NULL,
    "duration" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "reportUrl" TEXT,
    "interviewScheduled" TEXT,
    "interviewDone" TEXT,
    "memo" TEXT,
    "integratedKeywords" TEXT,
    "aiSummary" TEXT,
    "fortuneColor" TEXT,
    "reportVersion" TEXT,
    "isIntegratedReport" BOOLEAN NOT NULL DEFAULT false,
    "markdownContent" TEXT,
    "markdownVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnosis_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animal_master" (
    "id" SERIAL NOT NULL,
    "animal" TEXT NOT NULL,
    "orientation" TEXT NOT NULL,
    "trait" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "caution" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "animal_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zodiac_master" (
    "id" SERIAL NOT NULL,
    "zodiac" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "element" TEXT NOT NULL,
    "nature" TEXT NOT NULL,
    "ruler" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zodiac_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mbti_master" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "trait" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "caution" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mbti_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taiheki_master" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "trait" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "career" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "taiheki_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "six_star_master" (
    "id" SERIAL NOT NULL,
    "star" TEXT NOT NULL,
    "plusminus" TEXT NOT NULL,
    "trait" TEXT NOT NULL,
    "career" TEXT NOT NULL,
    "caution" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "six_star_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "animal_master_animal_key" ON "animal_master"("animal");

-- CreateIndex
CREATE UNIQUE INDEX "zodiac_master_zodiac_key" ON "zodiac_master"("zodiac");

-- CreateIndex
CREATE UNIQUE INDEX "mbti_master_type_key" ON "mbti_master"("type");

-- CreateIndex
CREATE UNIQUE INDEX "taiheki_master_number_key" ON "taiheki_master"("number");

-- CreateIndex
CREATE UNIQUE INDEX "six_star_master_star_plusminus_key" ON "six_star_master"("star", "plusminus");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");
