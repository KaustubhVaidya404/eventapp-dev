import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/utils/db"

export async function DELETE(req: NextRequest) {
    try {
        const userIdStr: string | null = req.nextUrl.searchParams.get("userId")
        const subEventIdStr: string | null = req.nextUrl.searchParams.get("subEventId")

        let userId: number
        let subEventId: number

        if (userIdStr == null || subEventIdStr == null){
            throw "userId or subEventIdStr cannot be null"
        }
        
        userId = parseInt(userIdStr)
        subEventId = parseInt(subEventIdStr)

        await prisma.userEvent.delete({
            where: {
                userId_subEventId: {
                    userId: userId,
                    subEventId: subEventId
                }
            }
        })

        return NextResponse.json({success: true}, {status: 200})

    } catch (err) {
        console.log("Error while deleting userEvent", err)
        return NextResponse.json({ success: false, error: "Deleting userEvent failed" }, { status: 500 })
    }
}