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
    detail: z.string().optional(),
	timestamp: z.iso.datetime()
});

export const RetriveSchema = z.object({
    userQuery: z.string(),
	previousSummary: z.string().optional()
});

export const PayloadSchema = z.object({
    header: z.string(),
    dataChunk: z.string(),
    parentId: z.uuidv4(),
    childIndex: z.number(),
	timestamp: z.iso.datetime()
});

export const PointSchema = z.object({
    id: z.uuidv4(),
    vector: z.array(z.number()),
    payload: PayloadSchema,
});

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
    startFrom: z.iso.datetime().optional(),
    limit: z.string().optional().default(10).transform(val => parseInt(val, 10)),
});
