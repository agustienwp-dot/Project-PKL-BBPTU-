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
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_logs` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `user_email` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL DEFAULT 'INFO',
    `details` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `system_logs_userId_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `milk_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `product_type` VARCHAR(191) NOT NULL DEFAULT 'SEGAR',
    `animal_type` VARCHAR(191) NOT NULL DEFAULT 'SAPI',
    `default_packaging` VARCHAR(191) NOT NULL DEFAULT 'botol',
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `milk_categories_name_key`(`name`),
    UNIQUE INDEX `milk_categories_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `milk_productions` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `category_id` VARCHAR(191) NOT NULL,
    `product_type` VARCHAR(191) NOT NULL DEFAULT 'SEGAR',
    `animal_type` VARCHAR(191) NOT NULL DEFAULT 'SAPI',
    `packaging_type` VARCHAR(191) NOT NULL DEFAULT 'botol',
    `raw_volume_liters` DOUBLE NOT NULL DEFAULT 0,
    `processed_liters` DOUBLE NOT NULL DEFAULT 0,
    `packaged_qty` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'SELESAI',
    `notes` VARCHAR(191) NULL,
    `created_by_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `gross_volume_liters` DOUBLE NOT NULL DEFAULT 0,
    `usage_type` VARCHAR(191) NULL,
    `usage_volume_liters` DOUBLE NOT NULL DEFAULT 0,
    `afkir_volume_liters` DOUBLE NOT NULL DEFAULT 0,
    `pedet_volume_liters` DOUBLE NOT NULL DEFAULT 0,
    `farm_origin` VARCHAR(191) NOT NULL DEFAULT 'Manggala',
    `shift` VARCHAR(191) NOT NULL DEFAULT 'Pagi',
    `keterangan_penjualan` VARCHAR(191) NULL,
    `sold_fresh_volume_liters` DOUBLE NOT NULL DEFAULT 0,
    `foto_timbangan` LONGTEXT NULL,
    `handover_status` VARCHAR(191) NOT NULL DEFAULT 'MENUNGGU_VERIFIKASI',
    `kode_transfer` VARCHAR(191) NULL,
    `nomor_segel` VARCHAR(191) NULL,
    `pin_verifikasi` VARCHAR(191) NULL,
    `received_volume_liters` DOUBLE NULL,
    `kirimKePI` DOUBLE NOT NULL DEFAULT 0,
    `produksi` DOUBLE NOT NULL DEFAULT 0,
    `rusakAfkir` DOUBLE NOT NULL DEFAULT 0,
    `setorPedet` DOUBLE NOT NULL DEFAULT 0,

    UNIQUE INDEX `milk_productions_kode_transfer_key`(`kode_transfer`),
    INDEX `milk_productions_categoryId_fkey`(`category_id`),
    INDEX `milk_productions_createdById_fkey`(`created_by_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packaged_product_items` (
    `id` VARCHAR(191) NOT NULL,
    `jenis_produk` VARCHAR(191) NOT NULL,
    `kemasan` VARCHAR(191) NOT NULL,
    `jumlah` DOUBLE NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'DITERIMA',
    `created_by_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `packaged_product_items_createdById_fkey`(`created_by_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packaged_products` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `animal_type` VARCHAR(191) NOT NULL DEFAULT 'SAPI',
    `category_id` VARCHAR(191) NULL,
    `processed_liters` DOUBLE NOT NULL DEFAULT 0,
    `botol_qty` INTEGER NOT NULL DEFAULT 0,
    `cup_qty` INTEGER NOT NULL DEFAULT 0,
    `plastik_bantal_qty` INTEGER NOT NULL DEFAULT 0,
    `total_packaged_qty` INTEGER NOT NULL DEFAULT 0,
    `origin` VARCHAR(191) NOT NULL DEFAULT 'Sapi',
    `package_size` VARCHAR(191) NULL,
    `packaging_details` TEXT NULL,
    `packaging_type` VARCHAR(191) NULL,
    `processed_amount` DOUBLE NOT NULL DEFAULT 0,
    `processed_unit` VARCHAR(191) NOT NULL DEFAULT 'Liter',
    `product_category` VARCHAR(191) NOT NULL DEFAULT 'Susu',
    `product_subtype` VARCHAR(191) NULL,
    `variant` VARCHAR(191) NULL,
    `condition` VARCHAR(191) NULL,
    `quantity_received` INTEGER NOT NULL DEFAULT 0,
    `quantity_sent` INTEGER NOT NULL DEFAULT 0,
    `received_at` DATETIME(3) NULL,
    `received_by_id` VARCHAR(191) NULL,
    `received_by_name` VARCHAR(191) NULL,
    `reception_notes` TEXT NULL,
    `sent_at` DATETIME(3) NULL,
    `sent_by_id` VARCHAR(191) NULL,
    `sent_by_name` VARCHAR(191) NULL,
    `production_id` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'DITERIMA',
    `notes` TEXT NULL,
    `created_by_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `packaged_products_createdById_fkey`(`created_by_id`),
    INDEX `packaged_products_categoryId_fkey`(`category_id`),
    INDEX `packaged_products_productionId_fkey`(`production_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `milk_outflows` (
    `id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `product_type` VARCHAR(191) NOT NULL DEFAULT 'SEGAR',
    `animal_type` VARCHAR(191) NOT NULL DEFAULT 'SAPI',
    `packaging_type` VARCHAR(191) NOT NULL DEFAULT 'botol',
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `notes` VARCHAR(191) NULL,
    `created_by_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `milk_outflows_categoryId_fkey`(`category_id`),
    INDEX `milk_outflows_createdById_fkey`(`created_by_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `milk_sales` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `variant` VARCHAR(191) NULL,
    `catatan` VARCHAR(191) NULL,
    `hargaJual` DOUBLE NOT NULL DEFAULT 0,
    `jumlah` DOUBLE NOT NULL DEFAULT 0,
    `kategoriBayar` VARCHAR(191) NOT NULL DEFAULT 'PNBP',
    `pembeli` VARCHAR(191) NOT NULL DEFAULT '',
    `produkRefId` VARCHAR(191) NULL,
    `sumber` VARCHAR(191) NOT NULL DEFAULT 'FRESH',
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `product_category` VARCHAR(191) NOT NULL DEFAULT 'Susu',
    `product_subtype` VARCHAR(191) NULL,
    `packaging_type` VARCHAR(191) NOT NULL DEFAULT 'Botol',
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `unit_price` DOUBLE NOT NULL DEFAULT 0,
    `total_price` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Berhasil',
    `notes` VARCHAR(191) NULL,
    `created_by_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `milk_sales_transactionId_key`(`transactionId`),
    INDEX `milk_sales_createdById_fkey`(`created_by_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bast_documents` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `nomor_ba` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `shift` VARCHAR(191) NULL DEFAULT 'Pagi',
    `farm_location` VARCHAR(191) NULL DEFAULT 'Tegalsari',
    `animal_type` VARCHAR(191) NULL DEFAULT 'SAPI',
    `unit` VARCHAR(191) NULL DEFAULT 'Liter',
    `total_produksi` DOUBLE NULL DEFAULT 0,
    `penggunaan_pedet` DOUBLE NULL DEFAULT 0,
    `afkir` DOUBLE NULL DEFAULT 0,
    `lain_lain` DOUBLE NULL DEFAULT 0,
    `diserahterimakan` DOUBLE NULL DEFAULT 0,
    `penerima_role` VARCHAR(191) NULL DEFAULT 'Seksi Pemasaran',
    `penerima_user_id` VARCHAR(191) NULL,
    `penerima_name` VARCHAR(191) NULL DEFAULT 'Seksi Pemasaran',
    `penyerah_role` VARCHAR(191) NULL DEFAULT 'Seksi Pemeliharaan',
    `penyerah_user_id` VARCHAR(191) NULL,
    `penyerah_name` VARCHAR(191) NULL DEFAULT 'Seksi Pemeliharaan',
    `status` VARCHAR(191) NULL DEFAULT 'DRAFT',
    `digital_signature` LONGTEXT NULL,
    `signed_at` DATETIME(3) NULL,
    `signed_by_name` VARCHAR(191) NULL,
    `read_at` DATETIME(3) NULL,
    `printed_at` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `production_id` VARCHAR(191) NULL,
    `created_by_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `confirmed_at` DATETIME(3) NULL,
    `confirmed_by` VARCHAR(191) NULL,
    `confirmed_by_name` VARCHAR(191) NULL,
    `giver_dept` VARCHAR(191) NULL DEFAULT 'Tim Kerja Layanan Pemasaran',
    `giver_name` VARCHAR(191) NULL DEFAULT 'Tim Kerja Layanan Pemasaran',
    `giver_title` VARCHAR(191) NULL,
    `items` TEXT NULL,
    `location` VARCHAR(191) NULL,
    `packaging_id` VARCHAR(191) NULL,
    `period` VARCHAR(191) NULL,
    `purpose` VARCHAR(191) NULL,
    `receiver_dept` VARCHAR(191) NULL,
    `receiver_name` VARCHAR(191) NULL,
    `receiver_title` VARCHAR(191) NULL,

    UNIQUE INDEX `bast_documents_nomor_ba_key`(`nomor_ba`),
    INDEX `bast_documents_createdById_fkey`(`created_by_id`),
    INDEX `bast_documents_productionId_fkey`(`production_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `berita_acara_logs` (
    `id` VARCHAR(191) NOT NULL,
    `berita_acara_id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `details` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `berita_acara_logs_beritaAcaraId_fkey`(`berita_acara_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'STOCK_ADDED',
    `targetRole` VARCHAR(191) NULL,
    `targetUserId` VARCHAR(191) NULL,
    `senderId` VARCHAR(191) NULL,
    `senderName` VARCHAR(191) NULL,
    `senderRole` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL DEFAULT '/pemasaran/terima-data',
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `milk_requests` (
    `id` VARCHAR(191) NOT NULL,
    `requestNo` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `volumeLiters` DOUBLE NOT NULL DEFAULT 0,
    `processingNeeds` VARCHAR(255) NOT NULL,
    `priority` VARCHAR(50) NOT NULL DEFAULT 'Normal',
    `notes` TEXT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'MENUNGGU_PERSETUJUAN',
    `rejectionReason` TEXT NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvedById` VARCHAR(191) NULL,
    `approvedByName` VARCHAR(255) NULL,
    `dispatchedAt` DATETIME(3) NULL,
    `readyForReceiptAt` DATETIME(3) NULL,
    `receivedVolumeLiters` DOUBLE NULL,
    `receivedAt` DATETIME(3) NULL,
    `receivedById` VARCHAR(191) NULL,
    `receivedByName` VARCHAR(255) NULL,
    `created_by_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `milk_requests_requestNo_key`(`requestNo`),
    INDEX `milk_requests_createdById_fkey`(`created_by_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `piutang` (
    `id` VARCHAR(191) NOT NULL,
    `milkSaleId` VARCHAR(191) NOT NULL,
    `jumlah_awal` DOUBLE NOT NULL,
    `sisa_piutang` DOUBLE NOT NULL,
    `lunas` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `piutang_milkSaleId_key`(`milkSaleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pelunasan_piutang` (
    `id` VARCHAR(191) NOT NULL,
    `piutang_id` VARCHAR(191) NOT NULL,
    `jumlah` DOUBLE NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `catatan` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pelunasan_piutang_piutangId_fkey`(`piutang_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packaging_materials` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) NOT NULL DEFAULT 'Kemasan',
    `unit` VARCHAR(50) NOT NULL DEFAULT 'pcs',
    `current_stock` DOUBLE NOT NULL DEFAULT 0,
    `minimum_stock` DOUBLE NOT NULL DEFAULT 500,
    `critical_stock` DOUBLE NOT NULL DEFAULT 200,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `packaging_materials_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `material_stock_movements` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `source` VARCHAR(50) NOT NULL DEFAULT 'PENYESUAIAN',
    `material_id` VARCHAR(191) NOT NULL,
    `previous_stock` DOUBLE NOT NULL DEFAULT 0,
    `new_stock` DOUBLE NOT NULL DEFAULT 0,
    `reference_id` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `created_by_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `material_stock_movements_materialId_fkey`(`material_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `system_logs` ADD CONSTRAINT `system_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milk_productions` ADD CONSTRAINT `milk_productions_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `milk_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milk_productions` ADD CONSTRAINT `milk_productions_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packaged_product_items` ADD CONSTRAINT `packaged_product_items_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packaged_products` ADD CONSTRAINT `packaged_products_production_id_fkey` FOREIGN KEY (`production_id`) REFERENCES `milk_productions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packaged_products` ADD CONSTRAINT `packaged_products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `milk_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packaged_products` ADD CONSTRAINT `packaged_products_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milk_outflows` ADD CONSTRAINT `milk_outflows_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `milk_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milk_outflows` ADD CONSTRAINT `milk_outflows_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milk_sales` ADD CONSTRAINT `milk_sales_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bast_documents` ADD CONSTRAINT `bast_documents_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bast_documents` ADD CONSTRAINT `bast_documents_production_id_fkey` FOREIGN KEY (`production_id`) REFERENCES `milk_productions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `berita_acara_logs` ADD CONSTRAINT `berita_acara_logs_berita_acara_id_fkey` FOREIGN KEY (`berita_acara_id`) REFERENCES `bast_documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milk_requests` ADD CONSTRAINT `milk_requests_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `piutang` ADD CONSTRAINT `piutang_milkSaleId_fkey` FOREIGN KEY (`milkSaleId`) REFERENCES `milk_sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pelunasan_piutang` ADD CONSTRAINT `pelunasan_piutang_piutang_id_fkey` FOREIGN KEY (`piutang_id`) REFERENCES `piutang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_stock_movements` ADD CONSTRAINT `material_stock_movements_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `packaging_materials`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
