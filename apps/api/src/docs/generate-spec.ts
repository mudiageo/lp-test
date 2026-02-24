import { createOpenApiSpec } from '@uraniadev/sveltekit-valibot-openapi';
import type { GlobModules } from '@uraniadev/sveltekit-valibot-openapi';
import { auth } from '../lib/auth';
import * as defs from './route-definitions';

/** Minimal shape of a better-auth OpenAPI spec returned by generateOpenAPISchema. */
interface BetterAuthOpenApiSpec {
  openapi?: string;
  info?: Record<string, unknown>;
  paths?: Record<string, unknown>;
  components?: Record<string, unknown>;
  tags?: Array<{ name: string; description?: string }>;
  security?: unknown[];
  servers?: unknown[];
}

/**
 * Builds the GlobModules map from our Express route definitions.
 * Keys are arbitrary identifiers (path inference is overridden by the
 * explicit `path` field in each defineEndpoint() call).
 */
function buildModules(): GlobModules {
  return {
    '/routes/ideas/+server.ts': async () => ({ _openapi: defs.ideasModule }),
    '/routes/ideas/trending/+server.ts': async () => ({ _openapi: defs.ideasTrendingModule }),
    '/routes/ideas/my/+server.ts': async () => ({ _openapi: defs.ideasMyModule }),
    '/routes/ideas/[id]/+server.ts': async () => ({ _openapi: defs.ideaByIdModule }),
    '/routes/ideas/[id]/vote/+server.ts': async () => ({ _openapi: defs.ideaVoteModule }),
    '/routes/ideas/[id]/comments/+server.ts': async () => ({ _openapi: defs.ideaCommentsModule }),
    '/routes/categories/+server.ts': async () => ({ _openapi: defs.categoriesModule }),
    '/routes/categories/[slug]/+server.ts': async () => ({ _openapi: defs.categoryBySlugModule }),
    '/routes/comments/[id]/+server.ts': async () => ({ _openapi: defs.commentByIdModule }),
    '/routes/health/+server.ts': async () => ({ _openapi: defs.healthModule }),
  };
}

/**
 * Deep-merges two plain objects. Arrays are concatenated without duplicates.
 */
function mergeDeep(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];
    if (
      sv !== null &&
      typeof sv === 'object' &&
      !Array.isArray(sv) &&
      tv !== null &&
      typeof tv === 'object' &&
      !Array.isArray(tv)
    ) {
      result[key] = mergeDeep(tv as Record<string, unknown>, sv as Record<string, unknown>);
    } else if (Array.isArray(sv) && Array.isArray(tv)) {
      // Deduplicate by JSON string representation
      const combined = [...tv, ...sv];
      const seen = new Set<string>();
      result[key] = combined.filter((item) => {
        const k = JSON.stringify(item);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    } else {
      result[key] = sv;
    }
  }
  return result;
}

let cachedSpec: Record<string, unknown> | null = null;

/**
 * Generates a combined OpenAPI spec from:
 *  1. Our app routes (via @uraniadev/sveltekit-valibot-openapi + defineEndpoint)
 *  2. better-auth routes (via the openAPI plugin's generator)
 *
 * Result is cached after the first call.
 */
export async function generateCombinedSpec(): Promise<Record<string, unknown>> {
  if (cachedSpec) return cachedSpec;

  const baseUrl = process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 3001}`;

  // ── 1. Generate the app spec ──────────────────────────────────────────────
  const appSpec = await createOpenApiSpec(buildModules(), {
    info: {
      title: 'Launchpad API',
      version: '1.0.0',
      description: 'API for the Launchpad idea validation platform',
    },
    servers: [
      { url: baseUrl, description: 'API server' },
    ],
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'better-auth.session_token',
        description: 'Session cookie set by better-auth after sign-in',
      } as Record<string, unknown>,
    },
  }) as unknown as Record<string, unknown>;

  // ── 2. Fetch the better-auth spec ─────────────────────────────────────────
  let authSpec: BetterAuthOpenApiSpec = {};
  try {
    const result: unknown = await (auth.api as Record<string, (args: Record<string, unknown>) => Promise<unknown>>)
      .generateOpenAPISchema({});
    if (result && typeof result === 'object') {
      authSpec = result as BetterAuthOpenApiSpec;
    }
  } catch (e) {
    console.warn('[docs] Could not generate better-auth OpenAPI spec:', (e as Error).message);
  }

  // ── 3. Merge: use app spec as base, merge in auth paths + components ──────
  type TagObject = { name: string; description?: string };
  const merged: Record<string, unknown> = {
    ...appSpec,
    // Keep app spec's info & servers
    info: appSpec.info,
    servers: appSpec.servers,
    paths: mergeDeep(
      (appSpec.paths as Record<string, unknown>) ?? {},
      authSpec.paths ?? {}
    ),
    components: mergeDeep(
      (appSpec.components as Record<string, unknown>) ?? {},
      authSpec.components ?? {}
    ),
    tags: [
      ...((appSpec.tags as TagObject[]) ?? []),
      ...(authSpec.tags ?? []),
    ].filter((tag, i, arr) =>
      arr.findIndex((t) => t.name === tag.name) === i
    ),
    security: [
      ...((appSpec.security as unknown[]) ?? []),
      ...(authSpec.security ?? []),
    ],
  };

  cachedSpec = merged;
  return merged;
}

/** Invalidates the cached spec (useful after config changes). */
export function invalidateSpecCache(): void {
  cachedSpec = null;
}
