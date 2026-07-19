import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import jwt from 'jsonwebtoken';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Ensure these are set in your .env file
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'superrefreshsecret';

export const loginOrRegister = async (req, res) => {
  try {
    const { email, name, avatarUrl, providerId } = req.body;

    if (!email || !providerId) {
      return res.status(400).json({ error: 'Email and providerId are required' });
    }

    // Find or create user
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, avatarUrl, providerId }, // Update details if logging in again
      create: {
        email,
        name,
        avatarUrl,
        providerId,
        provider: 'google',
      },
    });

    // Generate tokens
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Calculate expiration date for DB (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save refresh token to DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Set HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    res.json({ accessToken, user });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    // Check if token exists in DB
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!dbToken || dbToken.expiresAt < new Date()) {
      return res.status(403).json({ error: 'Refresh token invalid or expired in DB' });
    }

    // Rotate token (Delete old one)
    await prisma.refreshToken.delete({
      where: { id: dbToken.id },
    });

    // Create new tokens
    const newAccessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ userId: decoded.userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save new refresh token to DB
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: decoded.userId,
        expiresAt,
      },
    });

    // Set new cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Delete token from DB if it exists
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    // Clear the cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
