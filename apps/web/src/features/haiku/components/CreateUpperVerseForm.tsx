'use client';

import { useState } from 'react';
import { connectWallet, createUpperVerse } from '../utils/web3';
import { isAddress } from 'viem';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  verse: z.string().min(1, "上の句を入力してください"),
  recipientAddress: z.string()
    .min(42, "送信先アドレスを入力してください")
    .regex(/^0x[a-fA-F0-9]{40}$/, "有効なEthereumアドレスを入力してください")
    .refine((address) => isAddress(address), "有効なEthereumアドレスを入力してください"),
});

export function CreateUpperVerseForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      verse: "",
      recipientAddress: "0x0000000000000000000000000000000000000000",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { signer } = await connectWallet();
      setError('トランザクションを送信中...');
      const result = await createUpperVerse(signer, values.verse, values.recipientAddress);
      
      if (result.status === 1 && result.tokenId) {
        setError(`上の句が作成されました！NFT ID: ${result.tokenId}`);
        form.reset();
      } else {
        setError('トランザクションは失敗しました。もう一度お試しください。');
      }
    } catch (err) {
      console.error('Error creating verse:', err);
      if (err instanceof Error) {
        if (err.message.includes('user rejected')) {
          setError('トランザクションがキャンセルされました');
        } else if (err.message.includes('insufficient funds')) {
          setError('ETHの残高が不足しています');
        } else {
          setError(`エラー: ${err.message}`);
        }
      } else {
        setError('上の句の作成に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">上の句を作成</h3>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="verse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>上の句</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="上の句を入力してください"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recipientAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>送信先アドレス</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0x..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  処理中...
                </div>
              ) : (
                '上の句を作成'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
