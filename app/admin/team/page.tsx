import Link from "next/link";
import Image from "next/image";
import { Plus, User, Trash2 } from "lucide-react";
import { listTeamMembers, deleteTeamMember } from "@/app/admin/actions";

export const metadata = { title: "Team — Admin" };

export default async function TeamPage() {
  const members = await listTeamMembers();

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-heading font-bold text-foreground">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Profiles shown on the public-facing team section.
          </p>
        </div>
        <Link
          href="/admin/team/new"
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" />
          New Member
        </Link>
      </div>

      {/* List */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <User className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No team members yet.</p>
          <Link href="/admin/team/new" className="text-sm text-primary font-medium hover:underline">
            Add the first one
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm"
            >
              {/* Photo */}
              <div className="relative aspect-[3/2] bg-muted">
                {member.photo ? (
                  <Image src={member.photo} alt={member.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <User className="size-12 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1 p-4 flex-1">
                <p className="font-semibold text-sm text-foreground">{member.name}</p>
                <p className="text-xs text-primary">{member.title}</p>
                {member.credentials.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.credentials.map((c) => (
                      <span key={c} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{member.bio}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
                <form
                  action={async () => {
                    "use server";
                    await deleteTeamMember(member.id);
                  }}
                >
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
