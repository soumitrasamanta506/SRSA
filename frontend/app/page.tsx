import ChatComponent from "@/components/ChatComponent";

export default function Home() {
  return (
    <main className="flex h-screen w-full flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <ChatComponent />
    </main>
  );
}
