"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

interface User {
    id: Number
    name: string,
    email: string,
    phone: Number,
    imageUrl: string,
    class: string
}

async function getAllUser(setUsers: any) {
    let res = await fetch("/api/user")
    let resData = await res.json()
    setUsers(resData["usersSerialized"])
}

export default function () {
    let [users, setUsers] = useState([] as User[])
    let [searchString, setSearchString] = useState("")

    useEffect(() => {
        getAllUser(setUsers)
    }, [])

    return <div>
        <input className="bg-gray-200"
            onChange={(e) => { setSearchString(e.target.value) }}
            placeholder="search">
        </input>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone No.</th>
                    <th>ID-Card Image Url</th>
                    <th>Class</th>
                </tr>
            </thead>
            <tbody>
                {users && users.map((user) => {
                    if (user["name"].toLowerCase().includes(searchString.toLowerCase())) {
                        return <tr key={user["id"].toString()}>
                            <td className="text-blue-500 underline">
                                <Link href={"/user/" + user["id"]}>{user["name"]}</Link>
                            </td>
                            <td>{user["email"]}</td>
                            <td>{user["phone"].toString()}</td>
                            <td>{user["imageUrl"]}</td>
                            <td>{user["class"]}</td>
                        </tr>
                    }
                })}
            </tbody>
        </table>
    </div>
}