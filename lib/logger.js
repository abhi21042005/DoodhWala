// simple error logging utility
// in production you'd send these to a service like Sentry

const isDev = process.env.NODE_ENV !== 'production';

export function logError(context, error) {
  const timestamp = new Date().toISOString();
  const message = error?.message || String(error);
  const stack = error?.stack || '';

  if (isDev) {
    console.error(`[${timestamp}] [${context}]`, message);
    if (stack) console.error(stack);
  } else {
    // in production, you'd send to an error tracking service
    console.error(JSON.stringify({ timestamp, context, message }));
  }
}

export function logInfo(context, message) {
  if (isDev) {
    console.log(`[${context}]`, message);
  }
}
