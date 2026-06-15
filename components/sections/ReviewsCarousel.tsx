"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { getClinic } from "@/lib/useClinic";
import ReviewCard from "@/components/ui/ReviewCard";
import { cn } from "@/lib/utils";

const VISIBLE_COUNT = 3;

export default function ReviewsCarousel() {
  const clinic = getClinic();
  const reviews = clinic.reviews;
  const [currentIndex, setCurrentIndex] = useState(0);

  function prev() {
    setCurrentIndex((i) => (i - 1 + reviews.length) % reviews.length);
  }

  function next() {
    setCurrentIndex((i) => (i + 1) % reviews.length);
  }

  const displayed = Array.from(
    { length: VISIBLE_COUNT },
    (_, i) => reviews[(currentIndex + i) % reviews.length]
  );

  const { googleRating, reviewCount } = clinic.meta;
  const fullStars = Math.floor(googleRating);

  return (
    <section id="reviews" className="py-20 px-4 bg-muted/30 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center animate-fade-up">
          <p className="text-sm uppercase tracking-widest text-muted-foreground font-medium mb-3">
            Patient Stories
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold">
            What Our Patients Say
          </h2>
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-full">
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-4",
                    i < fullStars
                      ? "text-amber-400 fill-amber-400"
                      : "text-amber-300 fill-amber-100"
                  )}
                />
              ))}
            </span>
            <span className="text-sm font-semibold">{googleRating}</span>
            <span className="text-sm text-amber-700">
              ({reviewCount.toLocaleString()} reviews)
            </span>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {displayed.map((review, i) => (
            <div
              key={`${currentIndex}-${i}`}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <ReviewCard
                name={review.name}
                rating={review.rating}
                text={review.text}
                date={review.date}
                source={review.source}
              />
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous reviews"
            className="size-10 rounded-full border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
          >
            <ChevronLeft className="size-5" />
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Review pages">
            {reviews.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === currentIndex}
                aria-label={`Go to review ${i + 1}`}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "rounded-full transition-all",
                  i === currentIndex
                    ? "w-4 h-2 bg-primary"
                    : "size-2 bg-border hover:bg-muted-foreground/40"
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Next reviews"
            className="size-10 rounded-full border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* Bottom aggregate rating */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{googleRating} out of 5</span>{" "}
            based on{" "}
            <span className="font-semibold text-foreground">
              {reviewCount.toLocaleString()} reviews
            </span>{" "}
            on Google
          </p>
        </div>
      </div>
    </section>
  );
}
