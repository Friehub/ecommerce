export class SecretManager {
  private readonly isProd = process.env.NODE_ENV === 'production';

  /**
   * Safely retrieve a secret, enforcing presence in production.
   */
  get(key: string, fallback?: string): string {
    const value = process.env[key];
    
    if (!value || value.includes('placeholder')) {
      if (this.isProd) {
        console.error(`[SecretManager] FATAL: Missing critical secret ${key} in production!`);
        process.exit(1);
      }
      
      if (fallback) return fallback;
      throw new Error(`MISSING_SECRET: ${key}`);
    }

    return value;
  }

  /**
   * Helper for common secrets.
   */
  get jwtSecret() { return this.get('JWT_SECRET', 'dev_default_jwt_secret'); }
  get internalToken() { return this.get('INTERNAL_API_TOKEN', 'dev_internal_token'); }
  get redisUrl() { return this.get('REDIS_URL', 'redis://localhost:6379'); }
}

export const secretManager = new SecretManager();
