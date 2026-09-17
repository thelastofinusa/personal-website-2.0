import { Backpack, LinkCircle } from "reicon-react";
import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("The Good Stuff")
    .items([
      // ==================================================
      // WORK
      // ==================================================

      S.listItem()
        .title("Experience")
        .icon(LinkCircle)
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

      // ==================================================
      // EDUCATION
      // ==================================================

      S.listItem()
        .title("Education")
        .icon(Backpack)
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

      // ==================================================
      // CONTENT
      // ==================================================

      S.documentTypeListItem("project").title("Projects"),
      S.documentTypeListItem("article").title("Articles"),
      S.documentTypeListItem("dailyApp").title("Daily Apps"),

      S.divider(),

      // ==================================================
      // SETTINGS
      // ==================================================

      S.documentTypeListItem("projectFilter").title("Project Filters"),
      S.documentTypeListItem("articleUrl").title("Article URLs"),
    ]);
