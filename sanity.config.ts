"use client";

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import { codeInput } from "@sanity/code-input";
import { colorInput } from "@sanity/color-input";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { media } from "sanity-plugin-media";
import { schema } from "./src/sanity";
import { sendApprovalEmailAction } from "./src/sanity/actions/send-approval-email";
// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { structure } from "./src/sanity/structure";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema,
  document: {
    actions: (prev, context) =>
      context.schemaType === "testimonial"
        ? [...prev, sendApprovalEmailAction]
        : prev,
  },
  plugins: [
    structureTool({ structure }),
    codeInput(),
    colorInput(),
    media(),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
