'use client';

import { useState } from 'react';
import { connectWallet, addLowerVerse, getUserNFTs } from '../utils/web3';
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  tokenId: z.string().min(1, "NFT IDを入力してください"),
  verse: z.string().min(1, "下の句を入力してください"),
});

export function CreateLowerVerseForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTokens, setAvailableTokens] = useState<Array<{ tokenId: number; upperVerse: string }>>([]);

  useEffect(() => {
    const loadAvailableTokens = async () => {
      try {
        const { signer } = await connectWallet();
        const tokens = await getUserNFTs(signer);
        setAvailableTokens(tokens);
      } catch (err) {
        console.error('Error loading tokens:', err);
        setError('NFTの読み込みに失敗しました');
      }
    };

    loadAvailableTokens();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokenId: "",
      verse: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { signer } = await connectWallet();
      setError('トランザクションを送信中...');
      const result = await addLowerVerse(signer, parseInt(values.tokenId), values.verse);
      
      if (result.status === 1 && result.success) {
        setError('下の句が追加され、和歌NFTが作成されました！');
        form.reset();
        try {
          // Reload available tokens after successful transaction
          const tokens = await getUserNFTs(signer);
          setAvailableTokens(tokens);
        } catch (err) {
          console.error('Error reloading tokens:', err);
          // Don't show error to user since the main transaction succeeded
        }
      } else {
        setError('トランザクションは失敗しました。もう一度お試しください。');
      }
    } catch (err) {
      console.error('Error adding lower verse:', err);
      if (err instanceof Error) {
        if (err.message.includes('user rejected')) {
          setError('トランザクションがキャンセルされました');
        } else if (err.message.includes('insufficient funds')) {
          setError('ETHの残高が不足しています');
        } else {
          setError(`エラー: ${err.message}`);
        }
      } else {
        setError('下の句の追加に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">下の句を追加</h3>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tokenId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NFT ID</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="">NFTを選択してください</option>
                      {availableTokens.map((token) => (
                        <option key={token.tokenId} value={token.tokenId}>
                          NFT #{token.tokenId} - {token.upperVerse}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="verse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>下の句</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="下の句を入力してください"
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
                '下の句を追加'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
