"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, KeyRound } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ForgetPassword } from "@/services/api"
import { toast } from "sonner"

const forgotSchema = z.object({
  email: z.string().min(1, { message: "Email không được để trống" }).email({ message: "Email không hợp lệ" })
})

type ForgotValues = z.infer<typeof forgotSchema>

export default function ForgotPasswordEmailPage() {
  const router = useRouter()

  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (values: ForgotValues) => {
    let res = await ForgetPassword(values.email);
    console.log(res);
    if (res.isSuccess && Number(res.statusCode) === 200){
      toast.success(res.message);
      router.push(`/auth/verify?flow=reset&email=${encodeURIComponent(values.email)}`)
    }else {
      toast.error(res.message)
    }
    
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8 md:p-10">
        {/* Back to Login */}
        <Link
          href="/auth/login"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-base">Quay lại đăng nhập</span>
        </Link>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-xl bg-gray-900 flex items-center justify-center">
            <KeyRound className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl font-semibold text-center text-gray-900 mb-2">
          Quên mật khẩu?
        </h1>
        <p className="text-center text-gray-500 mb-10 max-w-md mx-auto">
          Đừng lo! Nhập email của bạn và chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu.
        </p>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" className="bg-gray-100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-gray-900 hover:bg-gray-800 text-white"
            >
              Gửi mã xác nhận
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

