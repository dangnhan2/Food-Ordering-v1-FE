"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AddToCart, GetFeaturedFoodItems, GetFoodItems } from "@/services/api";
import { useAuth } from "@/context/context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Home() {
  const {user, fetchCart} = useAuth();
  const router = useRouter();
  const [featuredItems, setFeaturedItems] = useState<IFoodItem[] | null | undefined>();

  const fetchFeaturedItems = async () => {
    let res = await GetFeaturedFoodItems();
    if (res.isSuccess && Number(res.statusCode) === 200){
      if (res?.data){
        setFeaturedItems(res.data);
      }
    }
  }

  const handleAddToCart = async (item: IFoodItem) => {
    if (!user?.id) return;
    const cartItems: ICartItemRequest[] = [
      { menuId: item.id, quantity: 1, unitPrice: item.price }
    ];
    let res =  await AddToCart(user.id, cartItems)
    if (res.isSuccess && Number(res.statusCode) === 201){
      toast.success(res.message)
      fetchCart()
    }else{
      toast.error(res.message)
    }
  }

  useEffect(() => {
    fetchFeaturedItems();
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-100 py-16 px-4 md:px-8 lg:px-40">
        <div className="max-w-7xl mx-auto">
          {/* Fast Delivery Badge */}
          <div className="mb-6">
            <Badge className="bg-black text-white hover:bg-black/90 rounded-md px-3 py-1.5">
              Fast Delivery
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 max-w-2xl">
            Delicious Food, Delivered to Your Door
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-lg mb-8 max-w-2xl">
            Order from our selection of fresh, delicious meals prepared by top
            chefs. Fast delivery, amazing taste.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            {/* <Input
              type="search"
              placeholder="Tìm kiếm..."
              className="pl-12 h-12 rounded-lg bg-white text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            /> */}
          </div>
        </div>
      </div>

      {/* Popular Dishes Section */}
      <div className="px-4 md:px-8 lg:px-40 py-12 bg-purple-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Box 1: Section Header */}
          <Card className="bg-white shadow-md p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                  Món Ăn Nổi Bật
                </h2>
                <p className="text-gray-600 text-base md:text-lg">
                  Khám phá những món ăn được yêu thích nhất
                </p>
              </div>
              <Button
                onClick={() => router.push('/product')}
                className="bg-purple-600 text-white hover:bg-purple-700 rounded-lg px-6 py-2.5 flex items-center gap-2 h-auto"
              >
                Xem Tất Cả
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Box 2: Carousel Cards Container */}
          <Card className="bg-white shadow-md p-6">
            <Carousel
              opts={{
                align: "start",
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {featuredItems?.map((item) => (
                  <CarouselItem key={item.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                    <Card
                      className="overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/product/${item.id}`)}
                    >
                      {/* Image Section */}
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />            
                      </div>

                      {/* Content Section */}
                      <CardHeader className="px-5 py-4">
                        <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                          {item.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">
                          {item.description}
                        </CardDescription>
                        <p className="text-xs text-gray-500 mb-4">
                          {item.soldQuantity} đã bán
                        </p>
                      </CardHeader>

                      {/* Footer with Price and Add Button */}
                      <CardFooter className="px-5 pb-5 pt-0 flex items-center justify-between">
                        <div className="text-xl font-bold text-gray-900">
                          {item.price.toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})}
                        </div>
                        <Button
                          className="bg-black text-white hover:bg-black/90 rounded-md px-4 py-2 h-9 flex items-center gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Thêm
                        </Button>
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12 bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 shadow-lg" />
              <CarouselNext className="hidden md:flex -right-12 bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 shadow-lg" />
            </Carousel>
          </Card>
        </div>
      </div>

    </div>
  );
}