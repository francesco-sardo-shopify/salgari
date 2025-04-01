import { nanoid } from 'nanoid';

export function generateId(): string {
  return nanoid();
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
} 