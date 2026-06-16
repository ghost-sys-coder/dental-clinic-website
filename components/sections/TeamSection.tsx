import { getClinic } from "@/lib/useClinic";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import { asc } from "drizzle-orm";
import TeamCard from "@/components/ui/TeamCard";

export default async function TeamSection() {
  const clinic = getClinic();

  const dbMembers = await db
    .select()
    .from(teamMembers)
    .orderBy(asc(teamMembers.displayOrder), asc(teamMembers.createdAt));

  // Fall back to config if no DB members have been created yet
  const team = dbMembers.length > 0
    ? dbMembers.map((m) => ({
        slug: m.slug,
        name: m.name,
        title: m.title,
        credentials: m.credentials,
        bio: m.bio,
        photo: m.photo ?? "",
      }))
    : clinic.team;

  return (
    <section id="team" className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center animate-fade-up">
          <p className="text-sm uppercase tracking-widest text-muted-foreground font-medium mb-3">
            Meet Your Dentists
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold">
            {clinic.meta.name} Team
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Specialists dedicated to your smile
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {team.map((member, index) => (
            <div
              key={member.slug}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <TeamCard
                name={member.name}
                title={member.title}
                credentials={member.credentials}
                bio={member.bio}
                photo={member.photo}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
