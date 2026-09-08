import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'farm_secret_key_super_secure_123';
const JWT_EXPIRES_IN = '1d';

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hashedPassword) {
  return password == hashedPassword || bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function getAuthUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

export async function resolveValidUserId(authUser) {
  if (!authUser || !authUser.id) return null;
  try {
    const prisma = (await import('@/lib/prisma')).default;
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true },
    });
    return user ? user.id : null;
  } catch (err) {
    return null;
  }
}

