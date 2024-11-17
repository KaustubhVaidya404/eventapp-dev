import { prisma } from "@/utils/db"

export default async function ({ params }: { params: any }) {
    let userId = Number(params.id)
    if (Number.isNaN(userId)){
        return <div>Invalid Id</div>
    }
    let user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user){
        return <div>User Not Found</div>
    }
    return <div>
        <h1>Name: {user.name}</h1>
        <h1>Email: {user.email}</h1>
        <h1>Phone No.: {user.phone}</h1>
        <h1>QR Code: {user.imageUrl}</h1>
        <h1>Class: {user.class}</h1>
    </div>
}