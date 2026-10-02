import { environment, isFirebaseConfigured } from '../../environments/environment';

export async function firebaseApp(): Promise<import('firebase/app').FirebaseApp | null> {
  if (!isFirebaseConfigured()) return null;
  const { getApp, getApps, initializeApp } = await import('firebase/app');
  if (getApps().length) return getApp();
  return initializeApp(environment.firebase);
}

export function errorCode(error: unknown): string {
  if (typeof error === 'object' && error && 'code' in error) {
    return String((error as { code: unknown }).code);
  }
  return '';
}

export function errorText(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
