import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  name: string;
  rating: number;
  text: string;
  date: string;
  source: string;
}

function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function ReviewCard({
  name,
  rating,
  text,
  date,
  source,
}: ReviewCardProps) {
  return (
    <article className="bg-card border border-border rounded-xl p-6 flex flex-col gap-3 shadow-sm h-full">
      {/* Stars */}
      <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              "size-4",
              i < rating
                ? "text-amber-400 fill-amber-400"
                : "text-muted-foreground fill-transparent"
            )}
          />
        ))}
      </div>

      {/* Review text */}
      <blockquote className="text-sm text-foreground leading-relaxed italic flex-1">
        &ldquo;{text}&rdquo;
      </blockquote>

      {/* Footer */}
      <footer className="flex items-center justify-between gap-2 pt-1">
        <div>
          <p className="font-semibold text-sm">{name}</p>
          <time className="text-xs text-muted-foreground" dateTime={date}>
            {formatDate(date)}
          </time>
        </div>

        {/* Google badge */}
        <div
          className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border border-border"
          aria-label={`Review from ${source}`}
        >
          {/* Google G icon — simple coloured SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="size-3.5 shrink-0"
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span style={{ color: "#EA4335" }}>{source}</span>
        </div>
      </footer>
    </article>
  );
}
