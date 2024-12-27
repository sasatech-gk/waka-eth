"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { WakaSchema } from "@/features/waka/schema/waka-schema";

export default function CreateWakaForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof WakaSchema>>({
    resolver: zodResolver(WakaSchema),
    defaultValues: {
      upperVerse: "",
      lowerVerse: "",
      signature: "",
    },
  });

  async function onSubmit(values: z.infer<typeof WakaSchema>) {
    try {
      const response = await fetch("/api/waka", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create waka");
      }

      await response.json();
      // TODO: Implement Web3 signing logic here
      // TODO: Generate and navigate to collaboration URL
      router.refresh();
    } catch (error) {
      console.error("Error creating waka:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="upperVerse"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>上の句</FormLabel>
              <FormControl>
                <Input {...field} placeholder="上の句を入力してください" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lowerVerse"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>下の句</FormLabel>
              <FormControl>
                <Input {...field} placeholder="下の句を入力してください" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">作成</Button>
      </form>
    </Form>
  );
}
