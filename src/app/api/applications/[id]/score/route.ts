import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 })
    }

    const body = await request.json()
    const { score } = body

    if (typeof score !== "number") {
      return NextResponse.json({ error: "Score must be a number" }, { status: 400 })
    }

    const application = await prisma.application.update({
      where: { id },
      data: { score },
    })

    return NextResponse.json({ success: true, application })
  } catch (error) {
    console.error("Error updating application score:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
