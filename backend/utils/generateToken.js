import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined. Please set it in your environment variables.');
  }

  if (!id || !role) {
    throw new Error('User ID and role are required to generate token');
  }

  try {
    return jwt.sign({ id, role }, secret, {
      expiresIn: '30d',
    });
  } catch (error) {
    console.error('Error generating JWT token:', error.message);
    throw new Error('Failed to generate authentication token');
  }
};

export default generateToken;
