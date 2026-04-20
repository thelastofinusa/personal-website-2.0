// @ts-nocheck -- skip type checking
import * as docs_4 from "../content/work/index.mdx?collection=docs"
import * as docs_3 from "../content/work/bitterms.mdx?collection=docs"
import * as docs_2 from "../content/contact/index.mdx?collection=docs"
import * as docs_1 from "../content/about/index.mdx?collection=docs"
import * as docs_0 from "../content/(index)/index.mdx?collection=docs"
import { _runtime } from "fumadocs-mdx/runtime/next"
import * as _source from "../source.config"
export const docs = _runtime.docs<typeof _source.docs>([{ info: {"path":"(index)/index.mdx","fullPath":"content/(index)/index.mdx"}, data: docs_0 }, { info: {"path":"about/index.mdx","fullPath":"content/about/index.mdx"}, data: docs_1 }, { info: {"path":"contact/index.mdx","fullPath":"content/contact/index.mdx"}, data: docs_2 }, { info: {"path":"work/bitterms.mdx","fullPath":"content/work/bitterms.mdx"}, data: docs_3 }, { info: {"path":"work/index.mdx","fullPath":"content/work/index.mdx"}, data: docs_4 }], [{"info":{"path":"meta.json","fullPath":"content/meta.json"},"data":{"pages":["..."],"root":true}}, {"info":{"path":"work/meta.json","fullPath":"content/work/meta.json"},"data":{"title":"Work","pages":["..."]}}])