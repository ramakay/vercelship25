import { validateEnvironment, logEnvironmentStatus } from '@/app/lib/validate-env';

// Server component that validates environment on page load
export default function EnvironmentValidator() {
  // Log environment status (this runs on server)
  if (typeof window === 'undefined') {
    logEnvironmentStatus();
  }

  const { valid, errors } = validateEnvironment();

  if (!valid) {
    return (
      <div className="fixed top-4 right-4 max-w-md bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50">
        <h3 className="text-red-800 font-semibold mb-2">Configuration Error</h3>
        <ul className="text-sm text-red-700 space-y-1">
          {errors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
        <div className="mt-3 text-xs text-red-600">
          See console for setup instructions
        </div>
      </div>
    );
  }

  return null;
}