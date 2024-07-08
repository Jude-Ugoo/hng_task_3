import argon2 from 'argon2';

/**
 * Hashes the password using argon2.
 * 
 * @param password The plaintext password to hash.
 * @returns The hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password);
};

/**
 * Compares a plaintext password with a hashed password.
 * 
 * @param password The plaintext password.
 * @param hash The hashed password.
 * @returns True if the password matches the hash, false otherwise.
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return argon2.verify(hash, password);
};