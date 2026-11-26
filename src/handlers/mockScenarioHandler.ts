import { Response } from 'express';
import { ErrorResponse, MockScenario } from '../types/ecommerce';

const TIMEOUT_DELAY_MS = 3000;

const SUPPORTED_SCENARIOS: ReadonlySet<MockScenario> = new Set([
  'success',
  'payment_failure',
  'server_error',
  'unavailable',
  'timeout'
]);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simulates failure and delay scenarios controlled by the `x-mock-scenario` header.
 * Returns true when it has already sent an error response, or false to continue normally.
 */
export async function handleMockScenario(
  scenarioHeader: string | undefined,
  res: Response<ErrorResponse>
): Promise<boolean> {
  const scenario = scenarioHeader === undefined ? 'success' : scenarioHeader.trim().toLowerCase();

  if (!SUPPORTED_SCENARIOS.has(scenario as MockScenario)) {
    res.status(400).json({
      error: 'Unsupported Mock Scenario',
      message: `Unsupported mock scenario '${scenarioHeader}'. Supported scenarios: success, payment_failure, server_error, unavailable, timeout.`
    });
    return true;
  }

  switch (scenario as MockScenario) {
    case 'success':
      return false;

    case 'payment_failure':
      res.status(402).json({
        error: 'Payment Declined',
        message: 'Payment declined for this mock order.'
      });
      return true;

    case 'server_error':
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Simulated internal server error.'
      });
      return true;

    case 'unavailable':
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'Mock service unavailable.'
      });
      return true;

    case 'timeout':
      await delay(TIMEOUT_DELAY_MS);
      res.status(504).json({
        error: 'Gateway Timeout',
        message: `Mock service timed out after ${TIMEOUT_DELAY_MS}ms.`
      });
      return true;
  }
}
