import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";

interface UserAvatarProps {
  avatar?: string;
  className?: string;
}

const UserAvatar = ({ avatar, className }: UserAvatarProps) => {
  if (avatar) {
    return (
      <Image
        src={avatar}
        alt="Avatar người dùng"
        width={32}
        height={32}
        className={`rounded-full object-cover w-8 h-8 border border-gray-200 "${className || ''}"`}
      />
    );
  }
  return <FaUserCircle size={32} className={`text-gray-400 ${className || ''}`} />;
};

export default UserAvatar;
