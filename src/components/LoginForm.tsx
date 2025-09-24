// import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

type FormData = z.infer<typeof formSchema>;

const LoginForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { login } = useAuth();
  const [blockAutoFill, setBlockAutoFill] = useState(true);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // Clear any persisted values on reload/mount and after a short delay (to beat browser autofill)
  useEffect(() => {
    form.reset({ email: "", password: "" });
    const t1 = setTimeout(() => form.reset({ email: "", password: "" }), 50);
    const t2 = setTimeout(() => setBlockAutoFill(false), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleSubmit = async (data: FormData) => {
    const ok = await login(data.email, data.password);
    if (ok) {
      form.reset({ email: "", password: "" });
      onSuccess?.();
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" autoComplete="off">
        {/* Hidden bait fields to catch browser autofill (use different names to avoid conflicts) */}
        <input type="text" name="username-bait" autoComplete="username" className="hidden" tabIndex={-1} />
        <input type="password" name="password-bait" autoComplete="current-password" className="hidden" tabIndex={-1} />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" autoComplete="off" readOnly={blockAutoFill} {...field} />
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
                <Input type="password" placeholder="******" autoComplete="new-password" readOnly={blockAutoFill} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Form>
  );
};
export default LoginForm;