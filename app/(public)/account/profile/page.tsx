"use client"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/context";
import UserAvatar from "@/components/UserAvatar";
import { Trash2, MapPin } from "lucide-react";
import { ChangePassword, DeleteAddress, GetAddresses } from "@/services/api";
import { toast } from "sonner";

const TABS = ["Thông tin cá nhân", "Địa chỉ", "Bảo mật"] as const;
type TabKey = typeof TABS[number];

const ProfilePage = () => {
    const {user} = useAuth();
	const [activeTab, setActiveTab] = useState<TabKey>("Thông tin cá nhân");
    const [addresses, setAddresses] = useState<IAddress[] | null | undefined>();
    const storageKey = "profileActiveTab";

	// Security form (change password)
	const changePasswordSchema = z
		.object({
			currentPassword: z.string().min(6, "Tối thiểu 6 ký tự"),
			newPassword: z.string().min(6, "Tối thiểu 6 ký tự"),
			confirmPassword: z.string().min(6, "Tối thiểu 6 ký tự"),
		})
		.refine((data) => data.newPassword === data.confirmPassword, {
			message: "Mật khẩu xác nhận không khớp",
			path: ["confirmPassword"],
		});

	type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

	const changePasswordForm = useForm<ChangePasswordValues>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

    // Load saved tab on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved && (TABS as readonly string[]).includes(saved)) {
                setActiveTab(saved as TabKey);
            }
        } catch {}
    }, []);

    // Persist tab on change
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, activeTab);
        } catch {}
    }, [activeTab]);

	const fetchAddress = async () => {
		 let userId = user?.id
		 if (userId){
			let res = await GetAddresses(userId);	
			if (res.isSuccess && Number(res.statusCode === 200)){
				setAddresses(res?.data);
			}
		 }
	     
	}

	const handleDelete = async (id : string) => {
      let res = await DeleteAddress(id)
	  if (res.isSuccess && Number(res.statusCode) === 200){
		toast.success(res.message)
		fetchAddress()
	  }else{
		toast.error(res.message)
	  }
	}

	const onSubmit = async (values: ChangePasswordValues) => {
		let res = await ChangePassword(user?.id, values.currentPassword, values.newPassword, values.confirmPassword);
		if (res?.isSuccess && Number(res.statusCode) === 200) {		   
		  toast.success(res.message)
		} else {
		  toast.error(res.message)
		}
		// Handle login logic here
	  }

	useEffect(() => {
		if (user?.id) {
			fetchAddress();
		}
	}, [user?.id]);

	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-6 md:py-8">
			
			<h2 className="mb-6 text-2xl font-semibold tracking-tight">My Profile</h2>

			{/* Profile header card */}
			<div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
				<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
					<div className="relative h-24 w-24 shrink-0 rounded-full bg-muted text-3xl font-semibold text-muted-foreground grid place-items-center">
						<UserAvatar avatar={user?.imageUrl}>
                        </UserAvatar>
						<Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
							📷
						</Button>
					</div>
					<div className="space-y-1">
						<p className="text-base font-medium">{user?.fullName}</p>
						<p className="text-sm text-muted-foreground">{user?.email}</p>
						<div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
							<span className="inline-flex items-center gap-2 rounded-full border px-3 py-1">Member since 2024</span>
						</div>
					</div>
				</div>
			</div>

			{/* Tabs */}
			<div className="mb-6 grid grid-cols-1">
				<div className="grid grid-cols-3 rounded-xl border bg-muted/30 p-1 text-sm">
					{TABS.map((tab) => {
						const isActive = activeTab === tab;
						return (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={
									"flex items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors " +
									(isActive ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")
								}
							>
								{tab === "Thông tin cá nhân" && <span>👤</span>}
								{tab === "Địa chỉ" && <span>📍</span>}
								{tab === "Bảo mật" && <span>🔒</span>}
								<span>{tab}</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Content */}
			<div className="rounded-xl border bg-card p-6 shadow-sm">
				{activeTab === "Thông tin cá nhân" && (
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-medium">Thông tin cá nhân</h3>
							<Button variant="outline">Cập nhật thông tin</Button>
						</div>
						<p className="text-sm text-muted-foreground">Cập nhật thông tin cá nhân của bạn ở đây</p>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="fullName">Họ và tên</Label>
								<Input id="fullName" value={user?.fullName ?? ""} readOnly className="bg-muted/40" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email Address</Label>
								<Input id="email" value={user?.email ?? ""} readOnly className="bg-muted/40" />
							</div>
							<div className="space-y-2 sm:col-span-2">
								<Label htmlFor="phone">Số điện thoại</Label>
								<Input id="phone" placeholder="+1 (555) 000-0000" readOnly className="bg-muted/40" />
							</div>
						</div>
					</div>
				)}

				{activeTab === "Địa chỉ" && (
					<div className="space-y-6">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h3 className="text-lg font-medium">Địa chỉ đã lưu</h3>
								<p className="text-sm text-muted-foreground">Quản lí địa chỉ giao hàng</p>
							</div>
							<Button>
								<span className="mr-2">＋</span> Thêm địa chỉ
							</Button>
						</div>

						{/* Address list */}
						<div className="rounded-xl border">
							{Array.isArray(addresses) && addresses.length === 0 ? (
								<div className="flex flex-col items-center justify-center px-6 py-10 text-center">
									<div className="mb-4 grid h-12 w-12 place-items-center rounded-full border bg-muted/50">
										<MapPin className="h-6 w-6 text-muted-foreground" />
									</div>
									<h4 className="mb-1 text-base font-semibold">Bạn chưa có địa chỉ nào</h4>
									<p className="mb-5 max-w-xs text-sm text-muted-foreground">Thêm địa chỉ giao hàng đầu tiên để đặt hàng nhanh hơn trong lần tới.</p>							
								</div>
							) : (
								addresses?.map((a, idx) => (
									<div
										key={a.id ?? idx}
										className={
											"flex items-center justify-between px-5 py-4 " +
											(idx !== 0 ? "border-t" : "")
										}
									>   
									    <h1>{user?.fullName}</h1> | {user?.phoneNumber}
										<p className="text-base font-medium text-foreground">{a.address}</p>
										<Button
											variant="ghost"
											size="icon"
											className="text-destructive hover:text-destructive"
											aria-label="Delete address"
											onClick={() => handleDelete(a.id)}
										>
											<Trash2 className="h-5 w-5" />
										</Button>
									</div>
								))
							)}
						</div>
					</div>
				)}

				{activeTab === "Bảo mật" && (
					<div className="space-y-6">
						<div>
							<h3 className="text-lg font-medium">Đổi mật khẩu</h3>
						</div>
						<Form {...changePasswordForm}>
							<form onSubmit={changePasswordForm.handleSubmit(onSubmit)} className="space-y-6 max-w-sm">
								<FormField
									control={changePasswordForm.control}
									name="currentPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Mật khẩu hiện tại</FormLabel>
											<FormControl>
												<Input type="password" placeholder="••••••••" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={changePasswordForm.control}
									name="newPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Mật khẩu mới</FormLabel>
											<FormControl>
												<Input type="password" placeholder="••••••••" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={changePasswordForm.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Xác nhận mật khẩu</FormLabel>
											<FormControl>
												<Input type="password" placeholder="••••••••" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type="submit" className="w-full">Đổi mật khẩu</Button>
							</form>
						</Form>
					</div>
				)}
			</div>
		</div>
	);
};

export default ProfilePage;