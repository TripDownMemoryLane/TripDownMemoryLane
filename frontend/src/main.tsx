import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "@/lib/theme"; // ← 你的 theme.tsx 裡應該 export ThemeProvider

// React Query client，並設定 default query function
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        const res = await fetch(url);
        return res.json();
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="app-theme">
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
