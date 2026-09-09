-- CreateTable
CREATE TABLE `admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NULL,
    `password` VARCHAR(255) NULL,
    `role` VARCHAR(50) NULL,
    `record_flag` VARCHAR(31) NULL DEFAULT 'ACTIVE',

    UNIQUE INDEX `admin_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'ADMIN_FARM',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `userEmail` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL DEFAULT 'INFO',
    `details` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `milk_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `productType` VARCHAR(191) NOT NULL DEFAULT 'SEGAR',
    `animalType` VARCHAR(191) NOT NULL DEFAULT 'SAPI',
    `defaultPackaging` VARCHAR(191) NOT NULL DEFAULT 'botol',
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `milk_categories_name_key`(`name`),
    UNIQUE INDEX `milk_categories_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `milk_productions` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `shift` VARCHAR(191) NOT NULL DEFAULT 'Pagi',
    `farmOrigin` VARCHAR(191) NOT NULL DEFAULT 'Manggala',
    `categoryId` VARCHAR(191) NOT NULL,
    `productType` VARCHAR(191) NOT NULL DEFAULT 'SEGAR',
    `animalType` VARCHAR(191) NOT NULL DEFAULT 'SAPI',
    `packagingType` VARCHAR(191) NOT NULL DEFAULT 'botol',
    `grossVolumeLiters` DOUBLE NOT NULL DEFAULT 0,
    `pedetVolumeLiters` DOUBLE NOT NULL DEFAULT 0,
    `afkirVolumeLiters` DOUBLE NOT NULL DEFAULT 0,
    `soldFreshVolumeLiters` DOUBLE NOT NULL DEFAULT 0,
    `keteranganPenjualan` VARCHAR(191) NULL,
    `usageType` VARCHAR(191) NULL,
    `usageVolumeLiters` DOUBLE NOT NULL DEFAULT 0,
    `rawVolumeLiters` DOUBLE NOT NULL DEFAULT 0,
    `processedLiters` DOUBLE NOT NULL DEFAULT 0,
    `packagedQty` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'SELESAI',
    `notes` VARCHAR(191) NULL,
    `kodeTransfer` VARCHAR(191) NULL,
    `fotoTimbangan` LONGTEXT NULL,
    `nomorSegel` VARCHAR(191) NULL,
    `pinVerifikasi` VARCHAR(191) NULL,
    `handoverStatus` VARCHAR(191) NOT NULL DEFAULT 'MENUNGGU_VERIFIKASI',
    `receivedVolumeLiters` DOUBLE NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `milk_productions_kodeTransfer_key`(`kodeTransfer`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `milk_packagings` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `productCategory` VARCHAR(191) NOT NULL DEFAULT 'Susu',
    `productSubtype` VARCHAR(191) NULL,
    `origin` VARCHAR(191) NOT NULL DEFAULT 'Sapi',
    `variant` VARCHAR(191) NULL,
    `animalType` VARCHAR(191) NOT NULL DEFAULT 'SAPI',
    `categoryId` VARCHAR(191) NULL,
    `processedAmount` DOUBLE NOT NULL DEFAULT 0,
    `processedUnit` VARCHAR(191) NOT NULL DEFAULT 'Liter',
    `processedLiters` DOUBLE NOT NULL DEFAULT 0,
    `packagingDetails` TEXT NULL,
    `packagingType` VARCHAR(191) NULL,
    `packageSize` VARCHAR(191) NULL,
    `botolQty` INTEGER NOT NULL DEFAULT 0,
    `cupQty` INTEGER NOT NULL DEFAULT 0,
    `plastikBantalQty` INTEGER NOT NULL DEFAULT 0,
    `totalPackagedQty` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
    `sentAt` DATETIME(3) NULL,
    `sentById` VARCHAR(191) NULL,
    `sentByName` VARCHAR(191) NULL,
    `receivedAt` DATETIME(3) NULL,
    `receivedById` VARCHAR(191) NULL,
    `receivedByName` VARCHAR(191) NULL,
    `quantitySent` INTEGER NOT NULL DEFAULT 0,
    `quantityReceived` INTEGER NOT NULL DEFAULT 0,
    `condition` VARCHAR(191) NULL,
    `receptionNotes` TEXT NULL,
    `notes` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `milk_outflows` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `categoryId` VARCHAR(191) NOT NULL,
    `productType` VARCHAR(191) NOT NULL DEFAULT 'SEGAR',
    `animalType` VARCHAR(191) NOT NULL DEFAULT 'SAPI',
    `packagingType` VARCHAR(191) NOT NULL DEFAULT 'botol',
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `notes` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `milk_sales` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `productCategory` VARCHAR(191) NOT NULL DEFAULT 'Susu',
    `productSubtype` VARCHAR(191) NULL,
    `variant` VARCHAR(191) NULL,
    `packagingType` VARCHAR(191) NOT NULL DEFAULT 'Botol',
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `unitPrice` DOUBLE NOT NULL DEFAULT 0,
    `totalPrice` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Berhasil',
    `notes` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `milk_sales_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `berita_acara` (
    `id` VARCHAR(191) NOT NULL,
    `nomorBa` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `shift` VARCHAR(191) NOT NULL DEFAULT 'Pagi',
    `farmLocation` VARCHAR(191) NOT NULL DEFAULT 'Tegalsari',
    `animalType` VARCHAR(191) NOT NULL DEFAULT 'SAPI',
    `unit` VARCHAR(191) NOT NULL DEFAULT 'Liter',
    `totalProduksi` DOUBLE NOT NULL DEFAULT 0,
    `penggunaanPedet` DOUBLE NOT NULL DEFAULT 0,
    `afkir` DOUBLE NOT NULL DEFAULT 0,
    `lainLain` DOUBLE NOT NULL DEFAULT 0,
    `diserahterimakan` DOUBLE NOT NULL DEFAULT 0,
    `penerimaRole` VARCHAR(191) NOT NULL DEFAULT 'Seksi Pemasaran',
    `penerimaUserId` VARCHAR(191) NULL,
    `penerimaName` VARCHAR(191) NOT NULL DEFAULT 'Seksi Pemasaran',
    `penyerahRole` VARCHAR(191) NOT NULL DEFAULT 'Seksi Pemeliharaan',
    `penyerahUserId` VARCHAR(191) NULL,
    `penyerahName` VARCHAR(191) NOT NULL DEFAULT 'Seksi Pemeliharaan',
    `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
    `digitalSignature` LONGTEXT NULL,
    `signedAt` DATETIME(3) NULL,
    `signedByName` VARCHAR(191) NULL,
    `sentAt` DATETIME(3) NULL,
    `readAt` DATETIME(3) NULL,
    `printedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `productionId` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `berita_acara_nomorBa_key`(`nomorBa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `berita_acara_logs` (
    `id` VARCHAR(191) NOT NULL,
    `beritaAcaraId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `actorName` VARCHAR(191) NOT NULL,
    `actorRole` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `system_logs` ADD CONSTRAINT `system_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milk_productions` ADD CONSTRAINT `milk_productions_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `milk_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milk_productions` ADD CONSTRAINT `milk_productions_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milk_packagings` ADD CONSTRAINT `milk_packagings_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `milk_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milk_packagings` ADD CONSTRAINT `milk_packagings_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milk_outflows` ADD CONSTRAINT `milk_outflows_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `milk_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milk_outflows` ADD CONSTRAINT `milk_outflows_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milk_sales` ADD CONSTRAINT `milk_sales_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `berita_acara` ADD CONSTRAINT `berita_acara_productionId_fkey` FOREIGN KEY (`productionId`) REFERENCES `milk_productions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `berita_acara` ADD CONSTRAINT `berita_acara_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `berita_acara_logs` ADD CONSTRAINT `berita_acara_logs_beritaAcaraId_fkey` FOREIGN KEY (`beritaAcaraId`) REFERENCES `berita_acara`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
