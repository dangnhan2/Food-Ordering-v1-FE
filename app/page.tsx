"use client";
import { useAuth } from "@/context/context"

export default function Home() {
    const {user} = useAuth();
    return (
       <>
         <h1>{user?.fullName}</h1>
       </>
    )   
}
