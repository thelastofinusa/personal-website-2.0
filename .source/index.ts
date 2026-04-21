// @ts-nocheck -- skip type checking
import * as docs_4 from "../content/work.mdx?collection=docs"
import * as docs_3 from "../content/index.mdx?collection=docs"
import * as docs_2 from "../content/gallery.mdx?collection=docs"
import * as docs_1 from "../content/contact.mdx?collection=docs"
import * as docs_0 from "../content/about.mdx?collection=docs"
import { _runtime } from "fumadocs-mdx/runtime/next"
import * as _source from "../source.config"
export const docs = _runtime.docs<typeof _source.docs>([{ info: {"path":"about.mdx","fullPath":"content/about.mdx"}, data: docs_0 }, { info: {"path":"contact.mdx","fullPath":"content/contact.mdx"}, data: docs_1 }, { info: {"path":"gallery.mdx","fullPath":"content/gallery.mdx"}, data: docs_2 }, { info: {"path":"index.mdx","fullPath":"content/index.mdx"}, data: docs_3 }, { info: {"path":"work.mdx","fullPath":"content/work.mdx"}, data: docs_4 }], [{"info":{"path":"meta.json","fullPath":"content/meta.json"},"data":{"pages":["..."],"root":true}}])