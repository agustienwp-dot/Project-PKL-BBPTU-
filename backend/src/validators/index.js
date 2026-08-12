const { z } = require('zod');

// Middleware Helper for Zod Request Validation
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (parsed.body) req.body = parsed.body;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issueMsgs = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return res.status(400).json({
        success: false,
        message: `Validasi gagal - ${issueMsgs}`,
        data: null,
      });
    }
    next(error);
  }
};

// 1. Auth Schemas
const loginSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Format email tidak valid' }),
    password: z.string().min(1, { message: 'Password wajib diisi' }),
  }),
});

// 2. Cage Schemas
const cageSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Nama kandang wajib diisi' }),
    type: z.string().min(1, { message: 'Jenis kandang wajib diisi' }),
    location: z.string().min(1, { message: 'Lokasi kandang wajib diisi' }),
    capacity: z.number().int().positive({ message: 'Kapasitas kandang harus angka positif' }),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

const cageUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    type: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    capacity: z.number().int().positive({ message: 'Kapasitas kandang harus angka positif' }).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

// 3. Animal Schemas
const animalSchema = z.object({
  body: z.object({
    code: z.string().min(1, { message: 'Kode hewan wajib diisi' }),
    name: z.string().min(1, { message: 'Nama hewan wajib diisi' }),
    type: z.string().min(1, { message: 'Jenis hewan wajib diisi' }),
    breed: z.string().min(1, { message: 'Ras/Breed hewan wajib diisi' }),
    gender: z.string().min(1, { message: 'Jenis kelamin hewan wajib diisi' }),
    birthDate: z.string().datetime().or(z.string().date()).optional().nullable(),
    weight: z.number().positive({ message: 'Berat hewan harus angka positif' }),
    healthStatus: z.string().optional(),
    purchasePrice: z.number().nonnegative({ message: 'Harga beli tidak boleh negatif' }),
    estimatedSellingPrice: z.number().positive({ message: 'Estimasi harga jual harus angka positif' }).optional().nullable(),
    status: z.enum(['AVAILABLE', 'SOLD', 'DECEASED', 'TRANSFERRED'], {
      errorMap: () => ({ message: 'Status harus valid (AVAILABLE, SOLD, DECEASED, TRANSFERRED)' }),
    }).optional(),
    cageId: z.string().min(1, { message: 'Cage ID wajib diisi' }),
    entryDate: z.string().datetime().or(z.string().date()).optional(),
    origin: z.string().optional(),
    notes: z.string().optional(),
    photo: z.string().optional(),
  }),
});

const animalUpdateSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    breed: z.string().optional(),
    gender: z.string().optional(),
    birthDate: z.string().datetime().or(z.string().date()).optional().nullable(),
    weight: z.number().positive().optional(),
    healthStatus: z.string().optional(),
    purchasePrice: z.number().nonnegative().optional(),
    estimatedSellingPrice: z.number().positive().optional().nullable(),
    status: z.enum(['AVAILABLE', 'SOLD', 'DECEASED', 'TRANSFERRED']).optional(),
    cageId: z.string().optional(),
    origin: z.string().optional(),
    notes: z.string().optional(),
    photo: z.string().optional(),
  }),
});

// 4. Buyer Schemas
const buyerSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Nama pembeli wajib diisi' }),
    phone: z.string().min(1, { message: 'Nomor telepon wajib diisi' }),
    address: z.string().min(1, { message: 'Alamat wajib diisi' }),
    notes: z.string().optional(),
  }),
});

// 5. Sale Schemas
const saleSchema = z.object({
  body: z.object({
    animalId: z.string().min(1, { message: 'ID hewan wajib diisi' }),
    buyerId: z.string().min(1, { message: 'ID pembeli wajib diisi' }),
    weightAtSale: z.number().positive({ message: 'Berat saat dijual harus angka positif' }),
    sellingPrice: z.number().positive({ message: 'Harga penjualan harus angka positif' }),
    paymentMethod: z.string().min(1, { message: 'Metode pembayaran wajib diisi' }),
    notes: z.string().optional(),
  }),
});

// 6. Weight Record Schema
const weightRecordSchema = z.object({
  body: z.object({
    weight: z.number().positive({ message: 'Berat hewan harus angka positif' }),
    notes: z.string().optional(),
  }),
});

// 7. Movement Schema
const movementSchema = z.object({
  body: z.object({
    toCageId: z.string().min(1, { message: 'Kandang tujuan (toCageId) wajib diisi' }),
    notes: z.string().optional(),
  }),
});

module.exports = {
  validate,
  loginSchema,
  cageSchema,
  cageUpdateSchema,
  animalSchema,
  animalUpdateSchema,
  buyerSchema,
  saleSchema,
  weightRecordSchema,
  movementSchema,
};
