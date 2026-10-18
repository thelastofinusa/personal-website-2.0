import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

export const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});
