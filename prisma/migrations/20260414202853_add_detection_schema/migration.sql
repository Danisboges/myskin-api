-- CreateTable
CREATE TABLE "Detection" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Detection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Detection" ADD CONSTRAINT "Detection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
