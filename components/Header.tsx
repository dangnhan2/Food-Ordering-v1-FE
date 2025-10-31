"use client"
import Link from "next/link";
import { Button } from "./ui/button";
import { FaShoppingCart } from "react-icons/fa";
import Image from "next/image";
import { useAuth } from "@/context/context";
import UserMenu from "./UserMenu";
import { useRouter } from "next/navigation";
import { Logout } from "@/services/api";
import { toast } from "sonner";

const Header = () => {
  const { user, isAuthen, setAccessToken, setIsAuthen, setUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    let res = await Logout();
    if (res.isSuccess && Number(res.statusCode) === 200){
        setAccessToken(undefined);
        setUser(undefined);
        setIsAuthen(false);
        toast.success(res.message);
        router.push("/auth/login");
    }else{
        toast.error(res.message);
    }
    
  };

  return (
    <header className="w-full h-16 flex items-center px-40 bg-white shadow-sm justify-between">
      <div className="flex items-center gap-4">
        <Link href="/">
          <span className="rounded-xl bg-black p-2 flex items-center justify-center w-12 h-12">
            <Image
              src="/HapplyFoodLogo.jpg"
              alt="FoodHub Logo"
              width={32}
              height={32}
              className="object-cover w-8 h-8 rounded-full"
              priority
            />
          </span>
        </Link>
        <span className="font-bold text-xl ml-2">Happy Food</span>
        <nav className="flex gap-6 ml-6">
          <Link href="/">
            <span className="font-semibold hover:text-primary transition-colors">Trang chủ</span>
          </Link>
          <Link href="/contact">
            <span className="font-normal hover:text-primary transition-colors">Liên hệ</span>
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/cart">
          <FaShoppingCart size={22} className="hover:text-primary transition-colors"/>
        </Link>
        {isAuthen === true ? (
          <UserMenu fullName={user?.fullName} avatarUrl={user?.imageUrl} onLogout={handleLogout} />
        ) : (
          <Link href="/auth/login">
            <Button variant="ghost" className="font-semibold">Sign In</Button>
          </Link>
        )}       
      </div>
    </header>
  );
};

export default Header;
