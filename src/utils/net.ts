import { APIRequestContext, request } from '@playwright/test';

/** Try to reach base URL quickly. Returns true if status is 200-399, false otherwise. */
export async function canReach(baseURL: string): Promise<boolean> {
  let ctx: APIRequestContext | undefined;
  try {
    ctx = await request.newContext();
    const res = await ctx.get(baseURL, { timeout: 5000 });
    const ok = res.ok() || (res.status() >= 200 && res.status() < 400);
    return ok;
  } catch {
    return false;
  } finally {
    await ctx?.dispose();
  }
}
