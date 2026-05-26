-- CreateTable
CREATE TABLE "VisitLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "referringDomain" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClickEvent" (
    "id" TEXT NOT NULL,
    "visitLogId" TEXT NOT NULL,
    "pagePath" TEXT NOT NULL,
    "elementId" TEXT,
    "elementText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitLog_referringDomain_createdAt_idx" ON "VisitLog"("referringDomain", "createdAt");

-- CreateIndex
CREATE INDEX "VisitLog_utmSource_createdAt_idx" ON "VisitLog"("utmSource", "createdAt");

-- CreateIndex
CREATE INDEX "VisitLog_visitorId_idx" ON "VisitLog"("visitorId");

-- CreateIndex
CREATE INDEX "ClickEvent_visitLogId_idx" ON "ClickEvent"("visitLogId");

-- AddForeignKey
ALTER TABLE "ClickEvent" ADD CONSTRAINT "ClickEvent_visitLogId_fkey" FOREIGN KEY ("visitLogId") REFERENCES "VisitLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
