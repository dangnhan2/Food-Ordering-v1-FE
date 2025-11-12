"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GetFoodItemById, AddToCart } from "@/services/api";
import { useAuth } from "@/context/context";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, fetchCart } = useAuth();
  const [product, setProduct] = useState<IFoodItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params?.id || typeof params.id !== "string") return;

      try {
        setLoading(true);
        const res = await GetFoodItemById(params.id);
        if (res.isSuccess && Number(res.statusCode) === 200 && res.data) {
          setProduct(res.data);
        } else {
          toast.error("Không tìm thấy sản phẩm");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Có lỗi xảy ra khi tải sản phẩm");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params?.id, router]);

  const handleAddToCart = async () => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      router.push("/auth/login");
      return;
    }

    if (!product) return;

    const cartItems: ICartItemRequest[] = [
      { menuId: product.id, quantity: 1, unitPrice: product.price }
    ];

    try {
      const res = await AddToCart(user.id, cartItems);
      if (res.isSuccess && Number(res.statusCode) === 201) {
        toast.success(res.message || "Đã thêm vào giỏ hàng");
        fetchCart();
      } else {
        toast.error(res.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-8">
        {/* Back to Menu Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Trở về menu</span>
        </Link>

        {/* Product Detail Layout - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Product Image */}
          <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Right Column - Product Details */}
          <div className="flex flex-col space-y-6">

            {/* Product Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              {product.name}
            </h1>

            {/* Sales Count */}
            <p className="text-sm text-gray-500">
              {product.soldQuantity} đã bán
            </p>

            {/* Separator */}
            <div className="border-t border-gray-200"></div>

            {/* Description Section */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-gray-900">Mô tả</h2>
              <p className="text-base text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Category Section */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-gray-900">Danh mục</h2>
                  <Badge variant="secondary" className="w-fit">
                    {product.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Separator */}
            <div className="border-t border-gray-200"></div>

            {/* Price Section */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-gray-900">Giá</h2>
              <p className="text-2xl text-gray-900">
                {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </p>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12 text-base font-medium"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              Thêm vào giỏ hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
