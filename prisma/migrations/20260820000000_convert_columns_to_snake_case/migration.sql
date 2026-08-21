-- AlterTable users
ALTER TABLE `users` RENAME COLUMN `isActive` TO `is_active`;
ALTER TABLE `users` RENAME COLUMN `createdAt` TO `created_at`;
ALTER TABLE `users` RENAME COLUMN `updatedAt` TO `updated_at`;

-- AlterTable system_logs
ALTER TABLE `system_logs` DROP FOREIGN KEY `system_logs_userId_fkey`;
ALTER TABLE `system_logs` RENAME COLUMN `userId` TO `user_id`;
ALTER TABLE `system_logs` RENAME COLUMN `userEmail` TO `user_email`;
ALTER TABLE `system_logs` RENAME COLUMN `createdAt` TO `created_at`;
ALTER TABLE `system_logs` ADD CONSTRAINT `system_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable milk_categories
ALTER TABLE `milk_categories` RENAME COLUMN `productType` TO `product_type`;
ALTER TABLE `milk_categories` RENAME COLUMN `animalType` TO `animal_type`;
ALTER TABLE `milk_categories` RENAME COLUMN `defaultPackaging` TO `default_packaging`;
ALTER TABLE `milk_categories` RENAME COLUMN `createdAt` TO `created_at`;
ALTER TABLE `milk_categories` RENAME COLUMN `updatedAt` TO `updated_at`;

-- AlterTable milk_productions
ALTER TABLE `milk_productions` DROP FOREIGN KEY `milk_productions_categoryId_fkey`;
ALTER TABLE `milk_productions` DROP FOREIGN KEY `milk_productions_createdById_fkey`;
ALTER TABLE `milk_productions` RENAME COLUMN `farmOrigin` TO `farm_origin`;
ALTER TABLE `milk_productions` RENAME COLUMN `categoryId` TO `category_id`;
ALTER TABLE `milk_productions` RENAME COLUMN `productType` TO `product_type`;
ALTER TABLE `milk_productions` RENAME COLUMN `animalType` TO `animal_type`;
ALTER TABLE `milk_productions` RENAME COLUMN `packagingType` TO `packaging_type`;
ALTER TABLE `milk_productions` RENAME COLUMN `grossVolumeLiters` TO `gross_volume_liters`;
ALTER TABLE `milk_productions` RENAME COLUMN `pedetVolumeLiters` TO `pedet_volume_liters`;
ALTER TABLE `milk_productions` RENAME COLUMN `afkirVolumeLiters` TO `afkir_volume_liters`;
ALTER TABLE `milk_productions` RENAME COLUMN `soldFreshVolumeLiters` TO `sold_fresh_volume_liters`;
ALTER TABLE `milk_productions` RENAME COLUMN `keteranganPenjualan` TO `keterangan_penjualan`;
ALTER TABLE `milk_productions` RENAME COLUMN `usageType` TO `usage_type`;
ALTER TABLE `milk_productions` RENAME COLUMN `usageVolumeLiters` TO `usage_volume_liters`;
ALTER TABLE `milk_productions` RENAME COLUMN `rawVolumeLiters` TO `raw_volume_liters`;
ALTER TABLE `milk_productions` RENAME COLUMN `processedLiters` TO `processed_liters`;
ALTER TABLE `milk_productions` RENAME COLUMN `packagedQty` TO `packaged_qty`;
ALTER TABLE `milk_productions` RENAME COLUMN `kodeTransfer` TO `kode_transfer`;
ALTER TABLE `milk_productions` RENAME COLUMN `fotoTimbangan` TO `foto_timbangan`;
ALTER TABLE `milk_productions` RENAME COLUMN `nomorSegel` TO `nomor_segel`;
ALTER TABLE `milk_productions` RENAME COLUMN `pinVerifikasi` TO `pin_verifikasi`;
ALTER TABLE `milk_productions` RENAME COLUMN `handoverStatus` TO `handover_status`;
ALTER TABLE `milk_productions` RENAME COLUMN `receivedVolumeLiters` TO `received_volume_liters`;
ALTER TABLE `milk_productions` RENAME COLUMN `createdById` TO `created_by_id`;
ALTER TABLE `milk_productions` RENAME COLUMN `createdAt` TO `created_at`;
ALTER TABLE `milk_productions` RENAME COLUMN `updatedAt` TO `updated_at`;
ALTER TABLE `milk_productions` ADD CONSTRAINT `milk_productions_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `milk_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `milk_productions` ADD CONSTRAINT `milk_productions_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable milk_packagings
ALTER TABLE `milk_packagings` DROP FOREIGN KEY `milk_packagings_categoryId_fkey`;
ALTER TABLE `milk_packagings` DROP FOREIGN KEY `milk_packagings_createdById_fkey`;
ALTER TABLE `milk_packagings` RENAME COLUMN `productCategory` TO `product_category`;
ALTER TABLE `milk_packagings` RENAME COLUMN `productSubtype` TO `product_subtype`;
ALTER TABLE `milk_packagings` RENAME COLUMN `animalType` TO `animal_type`;
ALTER TABLE `milk_packagings` RENAME COLUMN `categoryId` TO `category_id`;
ALTER TABLE `milk_packagings` RENAME COLUMN `processedAmount` TO `processed_amount`;
ALTER TABLE `milk_packagings` RENAME COLUMN `processedUnit` TO `processed_unit`;
ALTER TABLE `milk_packagings` RENAME COLUMN `processedLiters` TO `processed_liters`;
ALTER TABLE `milk_packagings` RENAME COLUMN `packagingDetails` TO `packaging_details`;
ALTER TABLE `milk_packagings` RENAME COLUMN `packagingType` TO `packaging_type`;
ALTER TABLE `milk_packagings` RENAME COLUMN `packageSize` TO `package_size`;
ALTER TABLE `milk_packagings` RENAME COLUMN `botolQty` TO `botol_qty`;
ALTER TABLE `milk_packagings` RENAME COLUMN `cupQty` TO `cup_qty`;
ALTER TABLE `milk_packagings` RENAME COLUMN `plastikBantalQty` TO `plastik_bantal_qty`;
ALTER TABLE `milk_packagings` RENAME COLUMN `totalPackagedQty` TO `total_packaged_qty`;
ALTER TABLE `milk_packagings` RENAME COLUMN `sentAt` TO `sent_at`;
ALTER TABLE `milk_packagings` RENAME COLUMN `sentById` TO `sent_by_id`;
ALTER TABLE `milk_packagings` RENAME COLUMN `sentByName` TO `sent_by_name`;
ALTER TABLE `milk_packagings` RENAME COLUMN `receivedAt` TO `received_at`;
ALTER TABLE `milk_packagings` RENAME COLUMN `receivedById` TO `received_by_id`;
ALTER TABLE `milk_packagings` RENAME COLUMN `receivedByName` TO `received_by_name`;
ALTER TABLE `milk_packagings` RENAME COLUMN `quantitySent` TO `quantity_sent`;
ALTER TABLE `milk_packagings` RENAME COLUMN `quantityReceived` TO `quantity_received`;
ALTER TABLE `milk_packagings` RENAME COLUMN `receptionNotes` TO `reception_notes`;
ALTER TABLE `milk_packagings` RENAME COLUMN `createdById` TO `created_by_id`;
ALTER TABLE `milk_packagings` RENAME COLUMN `createdAt` TO `created_at`;
ALTER TABLE `milk_packagings` RENAME COLUMN `updatedAt` TO `updated_at`;
ALTER TABLE `milk_packagings` ADD CONSTRAINT `milk_packagings_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `milk_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `milk_packagings` ADD CONSTRAINT `milk_packagings_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable milk_outflows
ALTER TABLE `milk_outflows` DROP FOREIGN KEY `milk_outflows_categoryId_fkey`;
ALTER TABLE `milk_outflows` DROP FOREIGN KEY `milk_outflows_createdById_fkey`;
ALTER TABLE `milk_outflows` RENAME COLUMN `categoryId` TO `category_id`;
ALTER TABLE `milk_outflows` RENAME COLUMN `productType` TO `product_type`;
ALTER TABLE `milk_outflows` RENAME COLUMN `animalType` TO `animal_type`;
ALTER TABLE `milk_outflows` RENAME COLUMN `packagingType` TO `packaging_type`;
ALTER TABLE `milk_outflows` RENAME COLUMN `createdById` TO `created_by_id`;
ALTER TABLE `milk_outflows` RENAME COLUMN `createdAt` TO `created_at`;
ALTER TABLE `milk_outflows` RENAME COLUMN `updatedAt` TO `updated_at`;
ALTER TABLE `milk_outflows` ADD CONSTRAINT `milk_outflows_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `milk_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `milk_outflows` ADD CONSTRAINT `milk_outflows_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable milk_sales
ALTER TABLE `milk_sales` DROP FOREIGN KEY `milk_sales_createdById_fkey`;
ALTER TABLE `milk_sales` RENAME COLUMN `transactionId` TO `transaction_id`;
ALTER TABLE `milk_sales` RENAME COLUMN `productCategory` TO `product_category`;
ALTER TABLE `milk_sales` RENAME COLUMN `productSubtype` TO `product_subtype`;
ALTER TABLE `milk_sales` RENAME COLUMN `packagingType` TO `packaging_type`;
ALTER TABLE `milk_sales` RENAME COLUMN `unitPrice` TO `unit_price`;
ALTER TABLE `milk_sales` RENAME COLUMN `totalPrice` TO `total_price`;
ALTER TABLE `milk_sales` RENAME COLUMN `createdById` TO `created_by_id`;
ALTER TABLE `milk_sales` RENAME COLUMN `createdAt` TO `created_at`;
ALTER TABLE `milk_sales` RENAME COLUMN `updatedAt` TO `updated_at`;
ALTER TABLE `milk_sales` ADD CONSTRAINT `milk_sales_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable berita_acara
ALTER TABLE `berita_acara` DROP FOREIGN KEY `berita_acara_productionId_fkey`;
ALTER TABLE `berita_acara` DROP FOREIGN KEY `berita_acara_createdById_fkey`;
ALTER TABLE `berita_acara` RENAME COLUMN `nomorBa` TO `nomor_ba`;
ALTER TABLE `berita_acara` RENAME COLUMN `farmLocation` TO `farm_location`;
ALTER TABLE `berita_acara` RENAME COLUMN `animalType` TO `animal_type`;
ALTER TABLE `berita_acara` RENAME COLUMN `totalProduksi` TO `total_produksi`;
ALTER TABLE `berita_acara` RENAME COLUMN `penggunaanPedet` TO `penggunaan_pedet`;
ALTER TABLE `berita_acara` RENAME COLUMN `lainLain` TO `lain_lain`;
ALTER TABLE `berita_acara` RENAME COLUMN `penerimaRole` TO `penerima_role`;
ALTER TABLE `berita_acara` RENAME COLUMN `penerimaUserId` TO `penerima_user_id`;
ALTER TABLE `berita_acara` RENAME COLUMN `penerimaName` TO `penerima_name`;
ALTER TABLE `berita_acara` RENAME COLUMN `penyerahRole` TO `penyerah_role`;
ALTER TABLE `berita_acara` RENAME COLUMN `penyerahUserId` TO `penyerah_user_id`;
ALTER TABLE `berita_acara` RENAME COLUMN `penyerahName` TO `penyerah_name`;
ALTER TABLE `berita_acara` RENAME COLUMN `digitalSignature` TO `digital_signature`;
ALTER TABLE `berita_acara` RENAME COLUMN `signedAt` TO `signed_at`;
ALTER TABLE `berita_acara` RENAME COLUMN `signedByName` TO `signed_by_name`;
ALTER TABLE `berita_acara` RENAME COLUMN `sentAt` TO `sent_at`;
ALTER TABLE `berita_acara` RENAME COLUMN `readAt` TO `read_at`;
ALTER TABLE `berita_acara` RENAME COLUMN `printedAt` TO `printed_at`;
ALTER TABLE `berita_acara` RENAME COLUMN `productionId` TO `production_id`;
ALTER TABLE `berita_acara` RENAME COLUMN `createdById` TO `created_by_id`;
ALTER TABLE `berita_acara` RENAME COLUMN `createdAt` TO `created_at`;
ALTER TABLE `berita_acara` RENAME COLUMN `updatedAt` TO `updated_at`;
ALTER TABLE `berita_acara` ADD CONSTRAINT `berita_acara_production_id_fkey` FOREIGN KEY (`production_id`) REFERENCES `milk_productions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `berita_acara` ADD CONSTRAINT `berita_acara_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable berita_acara_logs
ALTER TABLE `berita_acara_logs` DROP FOREIGN KEY `berita_acara_logs_beritaAcaraId_fkey`;
ALTER TABLE `berita_acara_logs` RENAME COLUMN `beritaAcaraId` TO `berita_acara_id`;
ALTER TABLE `berita_acara_logs` RENAME COLUMN `actorName` TO `actor_name`;
ALTER TABLE `berita_acara_logs` RENAME COLUMN `actorRole` TO `actor_role`;
ALTER TABLE `berita_acara_logs` RENAME COLUMN `createdAt` TO `created_at`;
ALTER TABLE `berita_acara_logs` ADD CONSTRAINT `berita_acara_logs_berita_acara_id_fkey` FOREIGN KEY (`berita_acara_id`) REFERENCES `berita_acara`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
