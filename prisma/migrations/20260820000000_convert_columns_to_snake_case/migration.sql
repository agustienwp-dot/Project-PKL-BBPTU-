-- AlterTable users
ALTER TABLE `users` CHANGE COLUMN `isActive` `is_active` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `users` CHANGE COLUMN `createdAt` `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `users` CHANGE COLUMN `updatedAt` `updated_at` DATETIME(3) NOT NULL;

-- AlterTable system_logs
ALTER TABLE `system_logs` DROP FOREIGN KEY `system_logs_userId_fkey`;
ALTER TABLE `system_logs` CHANGE COLUMN `userId` `user_id` VARCHAR(191) NULL;
ALTER TABLE `system_logs` CHANGE COLUMN `userEmail` `user_email` VARCHAR(191) NOT NULL;
ALTER TABLE `system_logs` CHANGE COLUMN `createdAt` `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `system_logs` ADD CONSTRAINT `system_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable milk_categories
ALTER TABLE `milk_categories` CHANGE COLUMN `productType` `product_type` VARCHAR(191) NOT NULL DEFAULT 'SEGAR';
ALTER TABLE `milk_categories` CHANGE COLUMN `animalType` `animal_type` VARCHAR(191) NOT NULL DEFAULT 'SAPI';
ALTER TABLE `milk_categories` CHANGE COLUMN `defaultPackaging` `default_packaging` VARCHAR(191) NOT NULL DEFAULT 'botol';
ALTER TABLE `milk_categories` CHANGE COLUMN `createdAt` `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `milk_categories` CHANGE COLUMN `updatedAt` `updated_at` DATETIME(3) NOT NULL;

-- AlterTable milk_productions
ALTER TABLE `milk_productions` DROP FOREIGN KEY `milk_productions_categoryId_fkey`;
ALTER TABLE `milk_productions` DROP FOREIGN KEY `milk_productions_createdById_fkey`;
ALTER TABLE `milk_productions` CHANGE COLUMN `farmOrigin` `farm_origin` VARCHAR(191) NOT NULL DEFAULT 'Manggala';
ALTER TABLE `milk_productions` CHANGE COLUMN `categoryId` `category_id` VARCHAR(191) NOT NULL;
ALTER TABLE `milk_productions` CHANGE COLUMN `productType` `product_type` VARCHAR(191) NOT NULL DEFAULT 'SEGAR';
ALTER TABLE `milk_productions` CHANGE COLUMN `animalType` `animal_type` VARCHAR(191) NOT NULL DEFAULT 'SAPI';
ALTER TABLE `milk_productions` CHANGE COLUMN `packagingType` `packaging_type` VARCHAR(191) NOT NULL DEFAULT 'botol';
ALTER TABLE `milk_productions` CHANGE COLUMN `grossVolumeLiters` `gross_volume_liters` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `milk_productions` CHANGE COLUMN `pedetVolumeLiters` `pedet_volume_liters` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `milk_productions` CHANGE COLUMN `afkirVolumeLiters` `afkir_volume_liters` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `milk_productions` CHANGE COLUMN `soldFreshVolumeLiters` `sold_fresh_volume_liters` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `milk_productions` CHANGE COLUMN `keteranganPenjualan` `keterangan_penjualan` VARCHAR(191) NULL;
ALTER TABLE `milk_productions` CHANGE COLUMN `usageType` `usage_type` VARCHAR(191) NULL;
ALTER TABLE `milk_productions` CHANGE COLUMN `usageVolumeLiters` `usage_volume_liters` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `milk_productions` CHANGE COLUMN `rawVolumeLiters` `raw_volume_liters` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `milk_productions` CHANGE COLUMN `processedLiters` `processed_liters` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `milk_productions` CHANGE COLUMN `packagedQty` `packaged_qty` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `milk_productions` CHANGE COLUMN `kodeTransfer` `kode_transfer` VARCHAR(191) NULL;
ALTER TABLE `milk_productions` CHANGE COLUMN `fotoTimbangan` `foto_timbangan` LONGTEXT NULL;
ALTER TABLE `milk_productions` CHANGE COLUMN `nomorSegel` `nomor_segel` VARCHAR(191) NULL;
ALTER TABLE `milk_productions` CHANGE COLUMN `pinVerifikasi` `pin_verifikasi` VARCHAR(191) NULL;
ALTER TABLE `milk_productions` CHANGE COLUMN `handoverStatus` `handover_status` VARCHAR(191) NOT NULL DEFAULT 'MENUNGGU_VERIFIKASI';
ALTER TABLE `milk_productions` CHANGE COLUMN `receivedVolumeLiters` `received_volume_liters` DOUBLE NULL;
ALTER TABLE `milk_productions` CHANGE COLUMN `createdById` `created_by_id` VARCHAR(191) NULL;
ALTER TABLE `milk_productions` CHANGE COLUMN `createdAt` `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `milk_productions` CHANGE COLUMN `updatedAt` `updated_at` DATETIME(3) NOT NULL;
ALTER TABLE `milk_productions` DROP INDEX `milk_productions_kodeTransfer_key`, ADD UNIQUE INDEX `milk_productions_kode_transfer_key`(`kode_transfer`);
ALTER TABLE `milk_productions` ADD CONSTRAINT `milk_productions_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `milk_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `milk_productions` ADD CONSTRAINT `milk_productions_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable milk_packagings
ALTER TABLE `milk_packagings` DROP FOREIGN KEY `milk_packagings_categoryId_fkey`;
ALTER TABLE `milk_packagings` DROP FOREIGN KEY `milk_packagings_createdById_fkey`;
ALTER TABLE `milk_packagings` CHANGE COLUMN `productCategory` `product_category` VARCHAR(191) NOT NULL DEFAULT 'Susu';
ALTER TABLE `milk_packagings` CHANGE COLUMN `productSubtype` `product_subtype` VARCHAR(191) NULL;
ALTER TABLE `milk_packagings` CHANGE COLUMN `animalType` `animal_type` VARCHAR(191) NOT NULL DEFAULT 'SAPI';
ALTER TABLE `milk_packagings` CHANGE COLUMN `categoryId` `category_id` VARCHAR(191) NULL;
ALTER TABLE `milk_packagings` CHANGE COLUMN `processedAmount` `processed_amount` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `milk_packagings` CHANGE COLUMN `processedUnit` `processed_unit` VARCHAR(191) NOT NULL DEFAULT 'Liter';
ALTER TABLE `milk_packagings` CHANGE COLUMN `processedLiters` `processed_liters` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `milk_packagings` CHANGE COLUMN `packagingDetails` `packaging_details` TEXT NULL;
ALTER TABLE `milk_packagings` CHANGE COLUMN `packagingType` `packaging_type` VARCHAR(191) NULL;
ALTER TABLE `milk_packagings` CHANGE COLUMN `packageSize` `package_size` VARCHAR(191) NULL;
ALTER TABLE `milk_packagings` CHANGE COLUMN `botolQty` `botol_qty` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `milk_packagings` CHANGE COLUMN `cupQty` `cup_qty` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `milk_packagings` CHANGE COLUMN `plastikBantalQty` `plastik_bantal_qty` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `milk_packagings` CHANGE COLUMN `totalPackagedQty` `total_packaged_qty` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `milk_packagings` CHANGE COLUMN `sentAt` `sent_at` DATETIME(3) NULL;
ALTER TABLE `milk_packagings` CHANGE COLUMN `sentById` `sent_by_id` VARCHAR(191) NULL;
ALTER TABLE `milk_packagings` CHANGE COLUMN `sentByName` `sent_by_name` VARCHAR(191) NULL;
ALTER TABLE `milk_packagings` CHANGE COLUMN `receivedAt` `received_at` DATETIME(3) NULL;
ALTER TABLE `milk_packagings` CHANGE COLUMN `receivedById` `received_by_id` VARCHAR(191) NULL;
ALTER TABLE `milk_packagings` CHANGE COLUMN `receivedByName` `received_by_name` VARCHAR(191) NULL;
ALTER TABLE `milk_packagings` CHANGE COLUMN `quantitySent` `quantity_sent` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `milk_packagings` CHANGE COLUMN `quantityReceived` `quantity_received` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `milk_packagings` CHANGE COLUMN `receptionNotes` `reception_notes` TEXT NULL;
ALTER TABLE `milk_packagings` CHANGE COLUMN `createdById` `created_by_id` VARCHAR(191) NULL;
ALTER TABLE `milk_packagings` CHANGE COLUMN `createdAt` `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `milk_packagings` CHANGE COLUMN `updatedAt` `updated_at` DATETIME(3) NOT NULL;
ALTER TABLE `milk_packagings` ADD CONSTRAINT `milk_packagings_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `milk_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `milk_packagings` ADD CONSTRAINT `milk_packagings_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable milk_outflows
ALTER TABLE `milk_outflows` DROP FOREIGN KEY `milk_outflows_categoryId_fkey`;
ALTER TABLE `milk_outflows` DROP FOREIGN KEY `milk_outflows_createdById_fkey`;
ALTER TABLE `milk_outflows` CHANGE COLUMN `categoryId` `category_id` VARCHAR(191) NOT NULL;
ALTER TABLE `milk_outflows` CHANGE COLUMN `productType` `product_type` VARCHAR(191) NOT NULL DEFAULT 'SEGAR';
ALTER TABLE `milk_outflows` CHANGE COLUMN `animalType` `animal_type` VARCHAR(191) NOT NULL DEFAULT 'SAPI';
ALTER TABLE `milk_outflows` CHANGE COLUMN `packagingType` `packaging_type` VARCHAR(191) NOT NULL DEFAULT 'botol';
ALTER TABLE `milk_outflows` CHANGE COLUMN `createdById` `created_by_id` VARCHAR(191) NULL;
ALTER TABLE `milk_outflows` CHANGE COLUMN `createdAt` `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `milk_outflows` CHANGE COLUMN `updatedAt` `updated_at` DATETIME(3) NOT NULL;
ALTER TABLE `milk_outflows` ADD CONSTRAINT `milk_outflows_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `milk_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `milk_outflows` ADD CONSTRAINT `milk_outflows_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable milk_sales
ALTER TABLE `milk_sales` DROP FOREIGN KEY `milk_sales_createdById_fkey`;
ALTER TABLE `milk_sales` CHANGE COLUMN `transactionId` `transaction_id` VARCHAR(191) NOT NULL;
ALTER TABLE `milk_sales` CHANGE COLUMN `productCategory` `product_category` VARCHAR(191) NOT NULL DEFAULT 'Susu';
ALTER TABLE `milk_sales` CHANGE COLUMN `productSubtype` `product_subtype` VARCHAR(191) NULL;
ALTER TABLE `milk_sales` CHANGE COLUMN `packagingType` `packaging_type` VARCHAR(191) NOT NULL DEFAULT 'Botol';
ALTER TABLE `milk_sales` CHANGE COLUMN `unitPrice` `unit_price` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `milk_sales` CHANGE COLUMN `totalPrice` `total_price` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `milk_sales` CHANGE COLUMN `createdById` `created_by_id` VARCHAR(191) NULL;
ALTER TABLE `milk_sales` CHANGE COLUMN `createdAt` `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `milk_sales` CHANGE COLUMN `updatedAt` `updated_at` DATETIME(3) NOT NULL;
ALTER TABLE `milk_sales` DROP INDEX `milk_sales_transactionId_key`, ADD UNIQUE INDEX `milk_sales_transaction_id_key`(`transaction_id`);
ALTER TABLE `milk_sales` ADD CONSTRAINT `milk_sales_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable berita_acara
ALTER TABLE `berita_acara` DROP FOREIGN KEY `berita_acara_productionId_fkey`;
ALTER TABLE `berita_acara` DROP FOREIGN KEY `berita_acara_createdById_fkey`;
ALTER TABLE `berita_acara` CHANGE COLUMN `nomorBa` `nomor_ba` VARCHAR(191) NOT NULL;
ALTER TABLE `berita_acara` CHANGE COLUMN `farmLocation` `farm_location` VARCHAR(191) NOT NULL DEFAULT 'Tegalsari';
ALTER TABLE `berita_acara` CHANGE COLUMN `animalType` `animal_type` VARCHAR(191) NOT NULL DEFAULT 'SAPI';
ALTER TABLE `berita_acara` CHANGE COLUMN `totalProduksi` `total_produksi` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `berita_acara` CHANGE COLUMN `penggunaanPedet` `penggunaan_pedet` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `berita_acara` CHANGE COLUMN `lainLain` `lain_lain` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `berita_acara` CHANGE COLUMN `penerimaRole` `penerima_role` VARCHAR(191) NOT NULL DEFAULT 'Seksi Pemasaran';
ALTER TABLE `berita_acara` CHANGE COLUMN `penerimaUserId` `penerima_user_id` VARCHAR(191) NULL;
ALTER TABLE `berita_acara` CHANGE COLUMN `penerimaName` `penerima_name` VARCHAR(191) NOT NULL DEFAULT 'Seksi Pemasaran';
ALTER TABLE `berita_acara` CHANGE COLUMN `penyerahRole` `penyerah_role` VARCHAR(191) NOT NULL DEFAULT 'Seksi Pemeliharaan';
ALTER TABLE `berita_acara` CHANGE COLUMN `penyerahUserId` `penyerah_user_id` VARCHAR(191) NULL;
ALTER TABLE `berita_acara` CHANGE COLUMN `penyerahName` `penyerah_name` VARCHAR(191) NOT NULL DEFAULT 'Seksi Pemeliharaan';
ALTER TABLE `berita_acara` CHANGE COLUMN `digitalSignature` `digital_signature` LONGTEXT NULL;
ALTER TABLE `berita_acara` CHANGE COLUMN `signedAt` `signed_at` DATETIME(3) NULL;
ALTER TABLE `berita_acara` CHANGE COLUMN `signedByName` `signed_by_name` VARCHAR(191) NULL;
ALTER TABLE `berita_acara` CHANGE COLUMN `sentAt` `sent_at` DATETIME(3) NULL;
ALTER TABLE `berita_acara` CHANGE COLUMN `readAt` `read_at` DATETIME(3) NULL;
ALTER TABLE `berita_acara` CHANGE COLUMN `printedAt` `printed_at` DATETIME(3) NULL;
ALTER TABLE `berita_acara` CHANGE COLUMN `productionId` `production_id` VARCHAR(191) NULL;
ALTER TABLE `berita_acara` CHANGE COLUMN `createdById` `created_by_id` VARCHAR(191) NULL;
ALTER TABLE `berita_acara` CHANGE COLUMN `createdAt` `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `berita_acara` CHANGE COLUMN `updatedAt` `updated_at` DATETIME(3) NOT NULL;
ALTER TABLE `berita_acara` DROP INDEX `berita_acara_nomorBa_key`, ADD UNIQUE INDEX `berita_acara_nomor_ba_key`(`nomor_ba`);
ALTER TABLE `berita_acara` ADD CONSTRAINT `berita_acara_production_id_fkey` FOREIGN KEY (`production_id`) REFERENCES `milk_productions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `berita_acara` ADD CONSTRAINT `berita_acara_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable berita_acara_logs
ALTER TABLE `berita_acara_logs` DROP FOREIGN KEY `berita_acara_logs_beritaAcaraId_fkey`;
ALTER TABLE `berita_acara_logs` CHANGE COLUMN `beritaAcaraId` `berita_acara_id` VARCHAR(191) NOT NULL;
ALTER TABLE `berita_acara_logs` CHANGE COLUMN `actorName` `actor_name` VARCHAR(191) NOT NULL;
ALTER TABLE `berita_acara_logs` CHANGE COLUMN `actorRole` `actor_role` VARCHAR(191) NULL;
ALTER TABLE `berita_acara_logs` CHANGE COLUMN `createdAt` `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `berita_acara_logs` ADD CONSTRAINT `berita_acara_logs_berita_acara_id_fkey` FOREIGN KEY (`berita_acara_id`) REFERENCES `berita_acara`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
