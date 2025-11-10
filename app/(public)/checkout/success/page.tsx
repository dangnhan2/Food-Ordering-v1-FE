"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SuccessPage = () => {
    const searchParams = useSearchParams();
    const orderCode = searchParams.get("orderCode");

    return (
        <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center px-4 py-10">
            <Card className="w-full max-w-2xl">
                <CardContent className="p-10">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-6 inline-flex items-center justify-center rounded-full bg-green-100 p-6">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>

                        <h1 className="text-2xl font-semibold mb-2">Đơn hàng đã đặt thành công!</h1>

                        <div className="w-full rounded-xl bg-gray-100 py-5 px-6 mb-8">
                            <div className="text-sm text-gray-600">Mã đơn hàng</div>
                            <div className="mt-1 text-xl font-semibold">#{orderCode}</div>
                        </div>

                        <Link href="/">
                            <Button className="h-12 px-6 bg-black hover:bg-black/90 text-white">
                                <Home className="w-4 h-4 mr-2" />
                                Quay về trang chủ
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SuccessPage;


