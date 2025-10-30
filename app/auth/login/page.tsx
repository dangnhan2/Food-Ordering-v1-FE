"use client"

import { z } from "zod"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
 
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Login } from "@/services/api"
import { toast } from "sonner"
import { useAuth } from "@/context/context"
import { useRouter } from "next/navigation"
 
const loginSchema = z.object({
  email: z.string().email({
    message: "Email không được để trống.",
  }),
  password: z.string().min(6, {
    message: "Mật khẩu phải có ít nhất 6 ký tự.",
  }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const {setUser} = useAuth();
  const router = useRouter()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    let res = await Login(values.email, values.password);
    if (res?.isSuccess && Number(res.statusCode) === 200) {
      const token = res.data?.accessToken;
      if (token) {
        localStorage.setItem("access_token", token);
        setUser(res.data?.data);
      }
      
      toast.success(res.message);
      router.push("/");
    } else {
      toast.error(res.message)
    }
    // Handle login logic here
  }

  return (
    <div className="min-h-screen overflow-y-auto flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 md:p-10 my-auto">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
           Chào mừng trở lại
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Đăng nhập để tiếp tục
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Nhập mật khẩu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Forgot Password */}
            <div className="flex items-center justify-between">            
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button 
              type="submit" 
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            >
              Đăng nhập
            </Button>
          </form>
        </Form>

        {/* Divider */}
        <div className="my-6">
          <div className="h-px bg-gray-200"></div>
        </div>

        {/* Footer Links */}
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link 
              href="/auth/register" 
              className="font-semibold text-gray-900 hover:underline"
            >
              Đăng ký
            </Link>
          </p>
          <Link 
            href="/" 
            className="block text-sm text-gray-900 hover:underline font-medium"
          >
            Tiếp tục dưới dạng khách
          </Link>
        </div>
      </div>
    </div>
  )
}