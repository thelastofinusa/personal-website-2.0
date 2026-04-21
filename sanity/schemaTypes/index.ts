import { type SchemaTypeDefinition } from "sanity"

import { projectType } from "./project.type"
import { galleryType } from "./gallery.type"

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [galleryType, projectType],
}
