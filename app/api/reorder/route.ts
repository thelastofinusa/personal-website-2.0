import { writeClient } from "@/sanity/lib/client"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const updates: { _id: string; order: number }[] = await req.json()
    const tx = writeClient.transaction()

    for (const { _id, order } of updates) {
      tx.patch(_id, {
        set: { order },
      })
    }
    await tx.commit()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return new NextResponse("Failed to reorder", { status: 500 })
  }
}
