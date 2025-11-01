"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/context";
import UserAvatar from "@/components/UserAvatar";
import { Trash2, MapPin } from "lucide-react";
import { ChangePassword, DeleteAddress, GetAddresses, UpdateProfile, AddAddress, UpdateAddress } from "@/services/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const TABS = ["Thông tin cá nhân", "Địa chỉ", "Bảo mật"] as const;
type TabKey = typeof TABS[number];

const ProfilePage = () => {
  const { user, refresh } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("Thông tin cá nhân");
  const [addresses, setAddresses] = useState<IAddress[] | null | undefined>();
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.imageUrl);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<IAddress | null>(null);
  const [isUpdateAddressOpen, setIsUpdateAddressOpen] = useState(false);
  const [addressToUpdate, setAddressToUpdate] = useState<IAddress | null>(null);

  const storageKey = "profileActiveTab";

  // Schema đổi mật khẩu
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
  type ProfileValues = z.infer<typeof profileSchema>;

  // Schema thêm địa chỉ
  const addressSchema = z.object({
    address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  });

  type AddressValues = z.infer<typeof addressSchema>;

  const addressForm = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address: "",
    },
  });

  const updateAddressForm = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address: "",
    },
  });

  const changePasswordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Schema cập nhật thông tin cá nhân
  const profileSchema = z.object({
    fullName: z.string().min(2, "Vui lòng nhập họ tên"),
    email: z.string().email("Email không hợp lệ"),
    phoneNumber: z.string().min(10, "Vui lòng nhập số điện thoại"),
    avatar: z.instanceof(File).optional(),
  });
 
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      avatar: undefined,
    },
  });

  const fetchAddress = async () => {
    let userId = user?.id;
    if (userId) {
      let res = await GetAddresses(userId);
      if (res.isSuccess && Number(res.statusCode) === 200) {
        setAddresses(res?.data);
      }
    }
  };

  const handleDeleteClick = (address: IAddress) => {
    setAddressToDelete(address);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete?.id) return;
    
    let res = await DeleteAddress(addressToDelete.id);
    if (res.isSuccess && Number(res.statusCode) === 200) {
      fetchAddress();
      toast.success(res.message);
      setIsDeleteDialogOpen(false);
      setAddressToDelete(null);
    } else {
      toast.error(res.message);
    }
  };

  const handleAddAddress = async (values: AddressValues) => {
    if (user?.id){
      let res = await AddAddress(user.id, values.address);
      if (res.isSuccess && Number(res.statusCode) === 201) {
        toast.success(res.message);
        fetchAddress();
        setIsAddAddressOpen(false);
        addressForm.reset();
      } else {
        toast.error(res.message);
      }
    }   
  };

  const handleUpdateClick = (address: IAddress) => {
    setAddressToUpdate(address);
    updateAddressForm.reset({ address: address.address });
    setIsUpdateAddressOpen(true);
  };

  const handleUpdateAddress = async (values: AddressValues) => {
    if (addressToUpdate?.id && user?.id) {
      let res = await UpdateAddress(addressToUpdate.id, user.id, values.address);
      if (res.isSuccess && Number(res.statusCode) === 200) {
        toast.success(res.message);
        fetchAddress();
        setIsUpdateAddressOpen(false);
        setAddressToUpdate(null);
        updateAddressForm.reset();
      } else {
        toast.error(res.message);
      }
    }  
  };

  const onSubmit = async (values: ChangePasswordValues) => {
    let res = await ChangePassword(user?.id, values.currentPassword, values.newPassword, values.confirmPassword);

    if (res?.isSuccess && Number(res.statusCode) === 200) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleUpdateProfile = async (values: ProfileValues) => {
    let res = await UpdateProfile(user?.id, values.fullName, values.phoneNumber, values.avatar);
    if (res.isSuccess && Number(res.statusCode) === 200) {
      toast.success(res.message);
      refresh();
      // Reset avatar field sau khi submit thành công và quay về ảnh gốc
      profileForm.setValue("avatar", undefined);
      setAvatarPreview(user?.imageUrl);
    } else {
      toast.error(res.message);
    }
  };

   // Đồng bộ lại giá trị form khi user thay đổi (sau khi load async)
   useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user?.fullName ?? "",
        email: user?.email ?? "",
        phoneNumber: user?.phoneNumber ?? "",
        avatar: undefined,
      });
      setAvatarPreview(user?.imageUrl);
    }
  }, [user]);

  // Load tab lưu localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && (TABS as readonly string[]).includes(saved)) {
        setActiveTab(saved as TabKey);
      }
    } catch { }
  }, []);

  // Save tab
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, activeTab);
    } catch { }
  }, [activeTab]);

  useEffect(() => {
    if (user?.id) {
      fetchAddress()
    }
  }, [user?.id]);

  // Cleanup preview URL khi component unmount
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:py-8">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight">Hồ sơ của tôi</h2>

      {/* Tabs */}
      <div className="mb-6">
        <div className="grid grid-cols-3 rounded-xl border bg-muted/30 p-1 text-sm">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors ${isActive ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab === "Thông tin cá nhân" && "👤"}
                {tab === "Địa chỉ" && "📍"}
                {tab === "Bảo mật" && "🔒"}
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {/* THÔNG TIN CÁ NHÂN */}
        {activeTab === "Thông tin cá nhân" && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Thông tin cá nhân</h3>
            <p className="text-sm text-muted-foreground">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>

            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* Left: inputs (Form) */}
                <div className="sm:col-span-2 space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên</FormLabel>
                        <FormControl>
                          <Input placeholder="Nguyễn Văn A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="name@example.com" {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right: avatar */}
                <div className="sm:col-span-1">
                  <FormField
                    control={profileForm.control}
                    name="avatar"
                    render={({ field: { onChange } }) => (
                      <FormItem>
                        <FormLabel>Ảnh đại diện</FormLabel>
                        <FormControl>
                          <div className="flex flex-col items-center gap-4 rounded-lg border p-4">
                            {/* Avatar preview */}
                            <div className="relative h-24 w-24 rounded-full bg-muted grid place-items-center overflow-hidden">
                              {avatarPreview ? (
                                <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                              ) : (
                                <UserAvatar avatar={user?.imageUrl} />
                              )}
                            </div>

                            {/* File button */}
                            <Button
                              type="button"
                              className="w-full"
                              onClick={() => document.getElementById("avatarUpload")?.click()}
                            >
                              Chọn ảnh
                            </Button>

                            {/* Hidden file input */}
                            <input
                              id="avatarUpload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  onChange(file); // update form value

                                  // Cleanup preview cũ
                                  if (avatarPreview && avatarPreview.startsWith("blob:")) {
                                    URL.revokeObjectURL(avatarPreview);
                                  }
                                  const previewUrl = URL.createObjectURL(file);
                                  setAvatarPreview(previewUrl);
                                }
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>

                {/* Bottom submit button spans grid */}
                <div className="sm:col-span-3">
                  <Button type="submit" variant="outline">Cập nhật thông tin</Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* ĐỊA CHỈ */}
        {activeTab === "Địa chỉ" && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium">Địa chỉ đã lưu</h3>
                <p className="text-sm text-muted-foreground">Quản lí địa chỉ giao hàng</p>
              </div>
              <Dialog open={isAddAddressOpen} onOpenChange={setIsAddAddressOpen}>
                <DialogTrigger asChild>
                  <Button>＋ Thêm địa chỉ</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thêm địa chỉ mới</DialogTitle>
                    <DialogDescription>
                      Nhập địa chỉ giao hàng của bạn. Bạn có thể thêm nhiều địa chỉ.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...addressForm}>
                    <form onSubmit={addressForm.handleSubmit(handleAddAddress)} className="space-y-4">
                      <FormField
                        control={addressForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Địa chỉ</FormLabel>
                            <FormControl>
                              <Input placeholder="Ví dụ: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsAddAddressOpen(false);
                            addressForm.reset();
                          }}
                        >
                          Hủy
                        </Button>
                        <Button type="submit">Thêm địa chỉ</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-xl border">
              {Array.isArray(addresses) && addresses.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-full border bg-muted/50">
                    <MapPin className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="font-semibold">Bạn chưa có địa chỉ nào</h4>
                  <p className="text-sm text-muted-foreground">Thêm địa chỉ giao hàng đầu tiên để đặt hàng nhanh hơn.</p>
                </div>
              ) : (
                addresses?.map((a, idx) => (
                  <div key={a.id} className={`flex items-center justify-between px-5 py-4 ${idx !== 0 ? "border-t" : ""}`}>
                    <p className="font-medium">{a.address}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleUpdateClick(a)}
                      >                       
                        Cập nhật
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteClick(a)}
                      >                       
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Dialog cập nhật địa chỉ */}
            <Dialog open={isUpdateAddressOpen} onOpenChange={setIsUpdateAddressOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cập nhật địa chỉ</DialogTitle>
                  <DialogDescription>
                    Chỉnh sửa địa chỉ giao hàng của bạn.
                  </DialogDescription>
                </DialogHeader>
                <Form {...updateAddressForm}>
                  <form onSubmit={updateAddressForm.handleSubmit(handleUpdateAddress)} className="space-y-4">
                    <FormField
                      control={updateAddressForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Địa chỉ</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsUpdateAddressOpen(false);
                          setAddressToUpdate(null);
                          updateAddressForm.reset();
                        }}
                      >
                        Hủy
                      </Button>
                      <Button type="submit">Cập nhật địa chỉ</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Dialog xác nhận xóa địa chỉ */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Xác nhận xóa địa chỉ</DialogTitle>
                  <DialogDescription>
                    Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.
                    {addressToDelete && (
                      <span className="block mt-2 font-medium text-foreground">{addressToDelete.address}</span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDeleteDialogOpen(false);
                      setAddressToDelete(null);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteConfirm}
                  >
                    Xác nhận xóa
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* BẢO MẬT */}
        {activeTab === "Bảo mật" && (
          <div className="space-y-6 max-w-sm">
            <h3 className="text-lg font-medium">Đổi mật khẩu</h3>

            <Form {...changePasswordForm}>
              <form onSubmit={changePasswordForm.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={changePasswordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu hiện tại</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
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
                      <FormControl><Input type="password" {...field} /></FormControl>
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
                      <FormControl><Input type="password" {...field} /></FormControl>
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
