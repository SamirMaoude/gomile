// Integration tests for upload-client.ts — the file upload pipeline that handles
// presigning with the GoMile API and binary PUT uploads to S3. There are two
// distinct flows: authenticated (post-login document uploads) and anonymous
// (pre-registration, before an account exists). Both must handle already-remote
// URIs as pass-through and infer content-type and filename from the local URI.

import {
  presignUpload,
  uploadFileToPresignedUrl,
  uploadLocalFile,
  uploadLocalFileAnonymous,
} from '../../../lib/upload-client';
import { getAuthTokenStore } from '../../../lib/auth-storage';

// FileSystem.uploadAsync is mocked globally in jest.setup.js.
// Import it here so tests can assert on calls.
const FileSystem = require('expo-file-system/legacy');

function mockResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    headers: { get: jest.fn((name: string) => (name === 'content-type' ? 'application/json' : null)) },
  };
}

beforeEach(async () => {
  await getAuthTokenStore().setTokens({ accessToken: 'valid-at', refreshToken: 'valid-rt' });
  global.fetch = jest.fn();
  FileSystem.uploadAsync.mockResolvedValue({ status: 200 });
});

afterEach(async () => {
  await getAuthTokenStore().clearTokens();
});

// ── presignUpload ─────────────────────────────────────────────────────────────

describe('presignUpload', () => {
  test('throws AUTH_TOKEN_MISSING when no access token is stored', async () => {
    await getAuthTokenStore().clearTokens();
    await expect(presignUpload('doc.pdf', 'application/pdf')).rejects.toThrow(
      "Jeton d'authentification manquant"
    );
  });

  test('calls POST /uploads/presign with filename and contentType', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ uploadUrl: 'https://s3.aws/upload', fileUrl: 'https://cdn.com/doc.pdf' })
    );
    await presignUpload('cni.pdf', 'application/pdf');
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/uploads/presign');
    expect(JSON.parse(options.body)).toEqual({ filename: 'cni.pdf', contentType: 'application/pdf' });
  });

  test('returns uploadUrl and fileUrl from the response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ uploadUrl: 'https://s3.aws/upload?sig=x', fileUrl: 'https://cdn.com/x.jpg' })
    );
    const result = await presignUpload('photo.jpg', 'image/jpeg');
    expect(result.uploadUrl).toContain('s3.aws');
    expect(result.fileUrl).toContain('cdn.com');
  });
});

// ── uploadFileToPresignedUrl ──────────────────────────────────────────────────

describe('uploadFileToPresignedUrl', () => {
  test('calls FileSystem.uploadAsync with the S3 URL and content type header', async () => {
    await uploadFileToPresignedUrl('https://s3.aws/upload', 'file:///photo.jpg', 'image/jpeg');
    expect(FileSystem.uploadAsync).toHaveBeenCalledWith(
      'https://s3.aws/upload',
      'file:///photo.jpg',
      expect.objectContaining({
        httpMethod: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
      })
    );
  });

  test('throws when FileSystem.uploadAsync returns a non-2xx status', async () => {
    FileSystem.uploadAsync.mockResolvedValue({ status: 403 });
    await expect(
      uploadFileToPresignedUrl('https://s3.aws/upload', 'file:///photo.jpg', 'image/jpeg')
    ).rejects.toThrow('Upload S3 échoué (403)');
  });

  test('does not throw for status 201', async () => {
    FileSystem.uploadAsync.mockResolvedValue({ status: 201 });
    await expect(
      uploadFileToPresignedUrl('https://s3.aws/upload', 'file:///file.pdf', 'application/pdf')
    ).resolves.not.toThrow();
  });
});

// ── uploadLocalFile (authenticated) ──────────────────────────────────────────

describe('uploadLocalFile', () => {
  test('returns the URI directly when it starts with https://', async () => {
    const result = await uploadLocalFile('https://cdn.com/already-remote.jpg', 'fallback.jpg');
    expect(result).toBe('https://cdn.com/already-remote.jpg');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('returns the URI directly when it starts with http://', async () => {
    const result = await uploadLocalFile('http://cdn.local/file.pdf', 'fallback.pdf');
    expect(result).toBe('http://cdn.local/file.pdf');
  });

  test('presigns then uploads and returns fileUrl for a local PNG', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ uploadUrl: 'https://s3.aws/upload', fileUrl: 'https://cdn.com/img.png' })
    );
    const result = await uploadLocalFile('file:///local/img.png', 'fallback.jpg');
    expect(result).toBe('https://cdn.com/img.png');
    expect(FileSystem.uploadAsync).toHaveBeenCalledTimes(1);
  });

  test('infers image/png content type from .png extension', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ uploadUrl: 'https://s3.aws/up', fileUrl: 'https://cdn.com/x.png' })
    );
    await uploadLocalFile('file:///local/photo.png', 'fallback.jpg');
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.contentType).toBe('image/png');
  });

  test('infers application/pdf content type from .pdf extension', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ uploadUrl: 'https://s3.aws/up', fileUrl: 'https://cdn.com/x.pdf' })
    );
    await uploadLocalFile('file:///local/doc.pdf', 'fallback.pdf');
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.contentType).toBe('application/pdf');
  });

  test('infers image/jpeg as the default content type for unknown extensions', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ uploadUrl: 'https://s3.aws/up', fileUrl: 'https://cdn.com/x' })
    );
    await uploadLocalFile('file:///local/file-no-ext', 'fallback.jpg');
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.contentType).toBe('image/jpeg');
  });

  test('extracts filename from the URI when it contains an extension', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ uploadUrl: 'https://s3.aws/up', fileUrl: 'https://cdn.com/cni.jpg' })
    );
    await uploadLocalFile('file:///tmp/cni.jpg', 'fallback.jpg');
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.filename).toBe('cni.jpg');
  });

  test('uses the fallback name when the URI has no file extension', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ uploadUrl: 'https://s3.aws/up', fileUrl: 'https://cdn.com/x' })
    );
    await uploadLocalFile('file:///cache/tmpfile', 'my-document.jpg');
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.filename).toBe('my-document.jpg');
  });
});

// ── uploadLocalFileAnonymous (pre-registration) ───────────────────────────────

describe('uploadLocalFileAnonymous', () => {
  test('returns the URI directly when it is already a remote URL', async () => {
    const result = await uploadLocalFileAnonymous('https://cdn.com/remote.jpg', 'fallback.jpg');
    expect(result).toBe('https://cdn.com/remote.jpg');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('calls /uploads/presign without an Authorization header', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ uploadUrl: 'https://s3.aws/up', fileUrl: 'https://cdn.com/anon.jpg' })
    );
    await uploadLocalFileAnonymous('file:///tmp/anon.jpg', 'anon.jpg');
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers.authorization).toBeUndefined();
  });

  test('presigns and uploads, returning the resulting fileUrl', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ uploadUrl: 'https://s3.aws/anon', fileUrl: 'https://cdn.com/avatar.jpg' })
    );
    const result = await uploadLocalFileAnonymous('file:///tmp/avatar.jpg', 'avatar.jpg');
    expect(result).toBe('https://cdn.com/avatar.jpg');
    expect(FileSystem.uploadAsync).toHaveBeenCalledTimes(1);
  });

  test('throws when the presign endpoint returns an error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'Forbidden' }, 403));
    await expect(
      uploadLocalFileAnonymous('file:///tmp/x.jpg', 'x.jpg')
    ).rejects.toThrow('Forbidden');
  });
});
