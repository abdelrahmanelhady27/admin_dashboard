import { HttpErrorResponse } from '@angular/common/http';

const API_MESSAGE_TO_I18N: Record<string, string> = {
  'Please complete all mandatory fields before publishing': 'validation.completeRequiredFields',
  'A details page cannot be created more than once for the same service': 'validation.duplicateServicePage',
  'The selected service was not found or is not available.': 'validation.serviceRequired',
  'The file type is not supported': 'validation.unsupportedFileType',
  'The file size exceeds the allowed limit': 'validation.fileSizeExceeded',
  'Please enter the question and answer': 'validation.faqIncomplete',
  'You do not have permission to add or reorder quick links.': 'validation.noAddEditPermissionQuickLinks',
  'You do not have permission to delete quick links.': 'validation.noDeletePermissionQuickLinks'
};

/**
 * Extracts an i18n toast key from an HTTP/API error.
 * Maps known backend messages to translation keys; falls back to common.error.
 */
export function resolveApiErrorKey(err: unknown, fallback = 'common.error'): string {
  const raw = extractApiMessage(err);
  if (!raw) {
    return fallback;
  }

  const mapped = API_MESSAGE_TO_I18N[raw];
  if (mapped) {
    return mapped;
  }

  // Already an i18n key (e.g. validation.*)
  if (/^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)+$/.test(raw)) {
    return raw;
  }

  return fallback;
}

function extractApiMessage(err: unknown): string | null {
  if (!err) {
    return null;
  }

  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (typeof body === 'string' && body.trim()) {
      return body.trim();
    }
    if (body && typeof body === 'object') {
      const message = (body as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) {
        return message.trim();
      }
      const title = (body as { title?: unknown }).title;
      if (typeof title === 'string' && title.trim()) {
        return title.trim();
      }
    }
    return null;
  }

  if (err instanceof Error && err.message?.trim()) {
    return err.message.trim();
  }

  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
  }

  return null;
}
