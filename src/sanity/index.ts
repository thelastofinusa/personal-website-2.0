import type { SchemaTypeDefinition } from "sanity";
import { articleSchema } from "./schemas/article.schema";
import { articleUrlSchema } from "./schemas/articleUrl.schema";
import { blockContentType } from "./schemas/blockContentType";
import { projectSchema } from "./schemas/project.schema";
import { projectFilterSchema } from "./schemas/projectFilter.schema";
import { timelineSchema } from "./schemas/timeline.schema";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    projectSchema,
    projectFilterSchema,
    articleSchema,
    articleUrlSchema,
    timelineSchema,
  ],
};
