import * as z from "zod"
import { CompleteCard, relatedCardType, CompleteProperty, relatedPropertyType } from "./index"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const cardPropertyDefaultType = z.object({
  propertyDefaultId: z.string(),
  value: jsonSchema,
  cardId: z.string(),
  propertyId: z.string(),
})

export interface CompleteCardPropertyDefault extends z.infer<typeof cardPropertyDefaultType> {
  card: CompleteCard
  property: CompleteProperty
}

/**
 * relatedCardPropertyDefaultType contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedCardPropertyDefaultType: z.ZodSchema<CompleteCardPropertyDefault> = z.lazy(() => cardPropertyDefaultType.extend({
  card: relatedCardType,
  property: relatedPropertyType,
}))
