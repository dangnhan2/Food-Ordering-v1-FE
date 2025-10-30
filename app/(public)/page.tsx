import { useAuth } from "@/context/context"

const HomePage = () => {
    const {user} = useAuth();
    return (
        <div>
            <h1>{user?.fullName}</h1>
        </div>
    )
}

export default HomePage