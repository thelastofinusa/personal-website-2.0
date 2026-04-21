// app/api/resume/route.ts
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  const filePath = path.join(process.cwd(), "public/resume.pdf")
  const file = fs.readFileSync(filePath)

  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Holiday_Resume.pdf"',
    },
  })
}
