import { vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * A fake Supabase user object. Routes only use user.id,
 * user.email, and user.user_metadata.name.
 */
export const mockUser = {
  id: "user-1",
  email: "sergiu@example.com",
  user_metadata: { name: "Sergiu" },
};

/**
 * Creates a mock Supabase client.
 *
 * Each call to .from("table") starts a new query chain.
 * The chain is fully chainable (select, insert, update, delete, eq, order all return the chain).
 * The chain resolves to the next response from the responses queue when:
 *   - .single() is called, or
 *   - the chain is awaited directly (it's a thenable)
 */
type MockResponse = { data?: unknown; error?: unknown; count?: number | null };

export function createMockSupabase(responses: MockResponse[] = []) {
  let idx = 0;

  const supabase = {
    from: vi.fn(() => {
      const response = responses[idx++] ?? { data: null, error: null };
      const chain: Record<string, unknown> = {};

      for (const method of [
        "select", "insert", "update", "delete",
        "eq", "neq", "order", "limit",
      ]) {
        chain[method] = vi.fn(() => chain);
      }

      chain.single = vi.fn(() => response);

      // Make the chain awaitable for queries that don't end with .single()
      chain.then = (resolve: (value: unknown) => void) => resolve(response);

      return chain;
    }),
    auth: {
      getUser: vi.fn(),
    },
  };

  return supabase;
}

/**
 * Builds a NextRequest for testing route handlers.
 */
export function mockRequest(
  method: string,
  url: string,
  body?: Record<string, unknown>,
  headers?: Record<string, string>,
): NextRequest {
  const init: RequestInit = {
    method,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
  };

  if (body && method !== "GET") {
    init.body = JSON.stringify(body);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NextRequest has a stricter RequestInit type
  return new NextRequest(new URL(url, "http://localhost"), init as any);
}

/**
 * Reads the JSON body and status from a NextResponse.
 */
export async function readResponse(response: Response) {
  const json = await response.json();
  return { status: response.status, json };
}
