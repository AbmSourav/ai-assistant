import { z } from 'zod';

export const PointStoreParamsSchema = z.object({
    header: z.string(),
    detail: z.string()
})

export const PointDeleteParamsSchema = z.object({
    parentId: z.uuidv4(),
})

export const GetPointParamsSchema = z.object({
    ids: z.string().optional(),
    parentId: z.uuid().optional()
})

export const ParentPayloadSchema = z.object({
    header: z.string(),
    detail: z.string().optional()
});

export const RetriveSchema = z.object({
    userQuery: z.string(),
});

/**
 * Zod schema for Payload structure
 * Represents metadata associated with a point
 */
export const PayloadSchema = z.object({
    header: z.string(),
    dataChunk: z.string(),
    parentId: z.uuidv4(),
    childIndex: z.number()
});

/**
 * Zod schema for Point structure
 * Represents a vector point with id, vector, and optional payload
 */
export const PointSchema = z.object({
    id: z.uuidv4(),
    vector: z.array(z.number()),
    payload: PayloadSchema,
});

/**
 * Zod schema for creating/upserting points
 */
export const UpsertPointSchema = z.object({
    id: z.uuidv4(),
    vector: z.array(z.number()).min(1, 'Vector must contain at least one element'),
    payload: PayloadSchema,
});

export const UpsertParentPointSchema = z.object({
    id: z.uuidv4(),
    vector: z.array(z.number()).min(1, 'Vector must contain at least one element'),
    payload: ParentPayloadSchema,
});

export const GetDocumentsParamsSchema = z.object({
    page: z.string().optional().default(1).transform(val => parseInt(val, 10)),
    limit: z.string().optional().default(10).transform(val => parseInt(val, 10)),
});
