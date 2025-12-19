import { z } from 'zod';
import { insertDataPointSchema, dataPoints } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  data: {
    list: {
      method: 'GET' as const,
      path: '/api/data',
      responses: {
        200: z.array(z.custom<typeof dataPoints.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/data',
      input: insertDataPointSchema,
      responses: {
        201: z.custom<typeof dataPoints.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/data/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type DataPointInput = z.infer<typeof api.data.create.input>;
export type DataPointResponse = z.infer<typeof api.data.create.responses[201]>;
