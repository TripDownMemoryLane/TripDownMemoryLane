import { Heart } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Link } from "wouter";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 px-4 mx-auto max-w-4xl">
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">記憶花園</span>
          </div>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
