"use client";

import { useState } from "react";
import Image from "next/image";
import { getClinic } from "@/lib/useClinic";
import { cn } from "@/lib/utils";

export default function BeforeAfterGallery() {
  const clinic = getClinic();

  const [activeTabs, setActiveTabs] = useState<Array<"before" | "after">>(
    () => clinic.beforeAfter.map(() => "after" as const)
  );

  if (!clinic.features.showBeforeAfter) {
    return null;
  }

  const pairs = clinic.beforeAfter.slice(0, 3);

  function setTab(index: number, tab: "before" | "after") {
    setActiveTabs((prev) => {
      const next = [...prev];
      next[index] = tab;
      return next;
    });
  }

  return (
    <section id="beforeAfter" className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center animate-fade-up">
          <p className="text-sm uppercase tracking-widest text-muted-foreground font-medium mb-3">
            Results
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold">
            See the Brightsmile Difference
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Real patients, real results. Browse our treatment gallery to see what&apos;s
            possible for your smile.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {pairs.map((pair, index) => {
            const activeTab = activeTabs[index];

            return (
              <div
                key={index}
                className="flex flex-col gap-4 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image container */}
                <div className="relative overflow-hidden rounded-xl aspect-4/3 bg-muted">
                  {(["before", "after"] as const).map((side) => (
                    <Image
                      key={side}
                      src={side === "before" ? pair.before : pair.after}
                      alt={`${side === "before" ? "Before" : "After"}: ${pair.caption}`}
                      fill
                      className={cn(
                        "object-cover transition-opacity duration-500",
                        activeTab === side ? "opacity-100" : "opacity-0"
                      )}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ))}
                </div>

                {/* Caption + toggle */}
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-center">{pair.caption}</p>

                  <div
                    className="flex items-center justify-center rounded-full border border-border p-0.5 bg-background w-fit mx-auto"
                    role="group"
                    aria-label="Toggle before or after image"
                  >
                    <button
                      type="button"
                      onClick={() => setTab(index, "before")}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                        activeTab === "before"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      aria-pressed={activeTab === "before" ? "true" : "false"}
                    >
                      Before
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab(index, "after")}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                        activeTab === "after"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      aria-pressed={activeTab === "after" ? "true" : "false"}
                    >
                      After
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
