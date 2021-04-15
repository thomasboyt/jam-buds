import type { components, operations } from './_schema';

export type ApiSchema<
  T extends keyof components['schemas']
> = components['schemas'][T];

export type QueryParams<T extends keyof operations> = operations[T] extends {
  parameters: { query: any };
}
  ? operations[T]['parameters']['query']
  : never;

export type PathParams<T extends keyof operations> = operations[T] extends {
  parameters: { path: any };
}
  ? operations[T]['parameters']['path']
  : never;

export type SuccessResponse<
  T extends keyof operations
> = operations[T] extends {
  responses: { '200': any };
}
  ? operations[T]['responses']['200']['content']['application/json']
  : null;
