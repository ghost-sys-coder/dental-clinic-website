import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getTeamMember } from "@/app/admin/actions";
import TeamMemberForm from "@/components/admin/TeamMemberForm";

export const metadata = { title: "Edit Team Member — Admin" };

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getTeamMember(id);

  if (!member) notFound();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <Link
          href="/admin/team"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit mb-4"
        >
          <ChevronLeft className="size-4" />
          Back to Team
        </Link>
        <h1 className="text-xl font-heading font-bold text-foreground">Edit Team Member</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Changes are reflected on the public team section immediately.
        </p>
      </div>

      <TeamMemberForm
        initialData={{
          id: member.id,
          name: member.name,
          title: member.title,
          credentials: member.credentials,
          bio: member.bio,
          photo: member.photo,
          displayOrder: member.displayOrder,
        }}
      />
    </div>
  );
}
