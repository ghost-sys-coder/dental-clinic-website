import Image from "next/image";
import { User } from "lucide-react";

interface TeamCardProps {
  name: string;
  title: string;
  credentials: readonly string[];
  bio: string;
  photo: string;
}

export default function TeamCard({
  name,
  title,
  credentials,
  bio,
  photo,
}: TeamCardProps) {
  return (
    <article className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="relative aspect-[3/4] bg-muted/50">
        {photo ? (
          <Image
            src={photo}
            alt={`Photo of ${name}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="size-16 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-heading font-bold text-xl">{name}</h3>
        <p className="text-primary font-medium text-sm mt-1">{title}</p>

        {/* Credentials */}
        {credentials.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 mt-3" aria-label="Credentials">
            {credentials.map((cred) => (
              <li
                key={cred}
                className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full"
              >
                {cred}
              </li>
            ))}
          </ul>
        )}

        {/* Bio */}
        <p className="text-sm text-muted-foreground leading-relaxed mt-4 line-clamp-4">
          {bio}
        </p>
      </div>
    </article>
  );
}
