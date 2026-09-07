import { Briefcase4, GraduationCap, History3 } from "reicon-react";
import type { StructureResolver } from "sanity/structure";

import { siteConfig } from "@/config/site.config";

export const structure: StructureResolver = (S) =>
  S.list()
    .title(siteConfig.title)
    .items([
      S.documentTypeListItem("project"),
      S.documentTypeListItem("article"),

      // ==================================================
      // TIMELINE
      // ==================================================

      S.listItem()
        .title("Timeline")
        .icon(History3)
        .child(
          S.list()
            .title("Timeline")
            .items([
              S.listItem()
                .title("Experience")
                .icon(Briefcase4)
                .child(
                  S.documentList()
                    .title("Experience")
                    .filter('_type == "timeline" && category == "experience"')
                    .defaultOrdering([
                      {
                        field: "items[0].period.start",
                        direction: "desc",
                      },
                    ]),
                ),

              S.listItem()
                .title("Education")
                .icon(GraduationCap)
                .child(
                  S.documentList()
                    .title("Education")
                    .filter('_type == "timeline" && category == "education"')
                    .defaultOrdering([
                      {
                        field: "items[0].period.start",
                        direction: "desc",
                      },
                    ]),
                ),

              S.divider(),

              S.documentTypeListItem("timeline"),
            ]),
        ),

      S.divider(),

      S.documentTypeListItem("projectFilter"),
      S.documentTypeListItem("articleUrl"),
    ]);
