'use client';

import { useState } from 'react';
import { connectWallet, addLowerVerse, getVerse, getWakaNFTContract, getUserNFTs } from '../utils/web3';
import { useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
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
      await addLowerVerse(signer, parseInt(values.tokenId), values.verse);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add verse');
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '処理中...' : '下の句を追加'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
