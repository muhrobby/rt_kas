"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";

const FormSchema = z.object({
  username: z
    .string()
    .min(10, { message: "Nomor HP minimal 10 digit." })
    .max(15, { message: "Nomor HP maksimal 15 digit." }),
  password: z.string().min(6, { message: "Password minimal 6 karakter." }),
});

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    setErrorMsg(null);

    const translateError = (message?: string) => {
      if (!message) return "Login gagal. Periksa nomor HP dan password Anda.";
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes("invalid username or password")) {
        return "Nomor HP atau password salah.";
      }
      if (lowerMessage.includes("user not found")) {
        return "Pengguna tidak ditemukan.";
      }
      return message;
    };

    const { error } = await signIn.username({
      username: data.username,
      password: data.password,
      fetchOptions: {
        onSuccess: async () => {
          // Redirect to root — root page.tsx handles role-based redirect
          router.push("/");
          router.refresh();
        },
        onError: (ctx) => {
          const msg = translateError(ctx.error.message);
          setErrorMsg(msg);
          toast.error(msg);
        },
      },
    });

    if (error) {
      const msg = translateError(error.message);
      setErrorMsg(msg);
      toast.error(msg);
    }
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {errorMsg && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Gagal Masuk</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>No. Telepon</FormLabel>
              <FormControl>
                <Input
                  id="username"
                  type="tel"
                  placeholder="08123456789"
                  autoComplete="username"
                  inputMode="tel"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pr-10"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">{showPassword ? "Sembunyikan password" : "Tampilkan password"}</span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Masuk..." : "Masuk"}
        </Button>
      </form>
    </Form>
  );
}
