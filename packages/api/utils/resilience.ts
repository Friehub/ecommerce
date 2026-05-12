import CircuitBreaker from 'opossum';

const options = {
  timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
  resetTimeout: 30000 // After 30 seconds, try again.
};

/**
 * Creates a circuit breaker for a given function.
 */
export function createBreaker<T extends (...args: any[]) => Promise<any>>(
  action: T,
  name: string
) {
  const breaker = new CircuitBreaker(action, {
    ...options,
    name
  });

  breaker.on('open', () => console.warn(`[CircuitBreaker] ${name} is OPEN (Service Down)`));
  breaker.on('halfOpen', () => console.info(`[CircuitBreaker] ${name} is HALF_OPEN (Testing Recovery)`));
  breaker.on('close', () => console.info(`[CircuitBreaker] ${name} is CLOSED (Service Recovered)`));

  return breaker;
}
