"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/context";
import { AddToCart } from "@/services/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";

const TAX_RATE = 0.08;

const CartPage = () => {
    const { cart, user, fetchCart } = useAuth();
    const router = useRouter();

    const cartItems = useMemo(() => cart?.items || [], [cart?.items]);

    // ✅ Local state để control UI quantity (Optimistic Update)
    const [localItems, setLocalItems] = useState(cartItems);
    
    // Sync khi cart từ context thay đổi (từ server)
    useEffect(() => {
        setLocalItems(cartItems);
    }, [cartItems]);

    // Helper function for formatting currency
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("vi-VN") + "₫";
    };

    const subtotal = localItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity, 0
    );
    const totalQuantity = localItems.reduce((sum, item) => sum + item.quantity, 0);

    // ✅ Hàm gửi API và đồng bộ
    const syncCartWithServer = useCallback(async (itemsToSend: ICartItemRequest[]) => {
        if (!user?.id) return;

        try {
            const res = await AddToCart(user.id, itemsToSend);
            if (res.isSuccess) {
                await fetchCart(); // Lấy dữ liệu mới nhất từ backend
                return true;
            } else {
                toast.error("Lỗi server, đồng bộ lại giỏ hàng.");
                await fetchCart(); // Rollback trạng thái
                return false;
            }
        } catch {
            toast.error("Lỗi kết nối khi cập nhật giỏ hàng.");
            await fetchCart(); // Rollback trạng thái
            return false;
        }
    }, [user?.id, fetchCart]);


    // ✅ Hàm cập nhật số lượng
    const handleQuantityChange = async (itemId: string, newQuantity: number) => {
        if (!user?.id || !cart) return;
        if (newQuantity < 1) return;

        // 1. Optimistic Update (Cập nhật UI ngay)
        const updatedLocal = localItems.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        setLocalItems(updatedLocal);

        // 2. Chuẩn bị req gửi API
        const cartItemsRequest: ICartItemRequest[] = updatedLocal.map(item => ({
            menuId: item.menuId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
        }));

        // 3. Gửi API
        await syncCartWithServer(cartItemsRequest);
    };


    const handleCheckout = () => {
        if (localItems.length === 0) {
            toast.error("Giỏ hàng trống, vui lòng thêm sản phẩm.");
            return;
        }
        router.push("/checkout");
    };

    

    return (
        <div className="min-h-screen bg-[#F7F7F8]">
            <div className="max-w-6xl mx-auto px-4 py-10">

                <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-black mb-6">
                    <ArrowLeft className="w-4 h-4" /> Tiếp tục mua sắm
                </Link>

                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold">Giỏ hàng</h1>
                        <p className="text-sm text-gray-500">{localItems.length} sản phẩm trong giỏ</p>
                    </div>
                    <div></div>
                </div>

                {/* Header row */}
                <Card className="px-6 py-4 mb-3">
                    <div className="grid grid-cols-12 items-center text-sm font-medium text-gray-600">
                        <div className="col-span-6">Sản Phẩm</div>
                        <div className="col-span-2 text-center">Đơn Giá</div>
                        <div className="col-span-2 text-center">Số Lượng</div>
                        <div className="col-span-2 text-right">Số Tiền</div>
                    </div>
                </Card>

                {localItems.length === 0 ? (
                    <Card className="p-10 text-center">
                        <p className="text-gray-500 text-lg">Giỏ hàng của bạn trống</p>
                        <Link href="/">
                            <Button className="mt-4 bg-black hover:bg-black/90">Tiếp tục mua sắm</Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {localItems.map((item) => {
                            const lineTotal = item.unitPrice * item.quantity;
                            return (
                                <Card key={item.id} className="px-6 py-4">
                                    <div className="grid grid-cols-12 items-center gap-4">
                                        {/* Product */}
                                        <div className="col-span-6 flex items-center gap-4">
                                            <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                                                <Image src={item.imageUrl} alt={item.menuName} fill className="object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold truncate">{item.menuName}</h3>
                                            </div>
                                        </div>

                                        {/* Unit price */}
                                        <div className="col-span-2 text-center">
                                            <span className="font-semibold text-black">{formatCurrency(item.unitPrice)}</span>
                                        </div>

                                        {/* Quantity */}
                                        <div className="col-span-2">
                                            <div className="flex items-center justify-center gap-3">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full"
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </Button>
                                                <span className="font-medium w-6 text-center">{item.quantity}</span>
                                                <Button
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full bg-black hover:bg-black/80"
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                >
                                                    <Plus className="w-4 h-4 text-white" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Line total */}
                                        <div className="col-span-2 text-right">
                                            <span className="font-semibold text-black">{formatCurrency(lineTotal)}</span>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Bottom summary */}
                <Card className="mt-6 px-6 py-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <p className="text-gray-700">Tổng Số Lượng: <span className="font-semibold text-black">{totalQuantity}</span></p>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Tổng Thanh Toán:</p>
                                <p className="text-2xl font-extrabold text-black">{formatCurrency(subtotal)}</p>
                            </div>
                            <Button
                                onClick={handleCheckout}
                                disabled={localItems.length === 0}
                                className="h-11 px-6 bg-black text-white hover:bg-black/90 cursor-pointer"
                            >
                                Mua Hàng
                            </Button>
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
};

export default CartPage;