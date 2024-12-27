import { CreateUpperVerseForm } from '@/features/haiku/components/CreateUpperVerseForm';
import { CreateLowerVerseForm } from '@/features/haiku/components/CreateLowerVerseForm';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-2xl mx-auto space-y-12">
        <h1 className="text-3xl font-bold text-center mb-8">和歌 NFT システム</h1>
        
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">上の句を作成</h2>
          <CreateUpperVerseForm />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">下の句を追加</h2>
          <CreateLowerVerseForm />
        </section>
      </main>
    </div>
  );
}
