import crypto from 'crypto';

const generateRandomCode = (): string => {
  return crypto.randomBytes(10).toString('hex').slice(0, 6);
};

export {
  generateRandomCode
}; 