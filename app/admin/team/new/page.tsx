import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import TeamMemberForm from "@/components/admin/TeamMemberForm";

export const metadata = { title: "New Team Member — Admin" };

export default function NewTeamMemberPage() {
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
        <h1 className="text-xl font-heading font-bold text-foreground">New Team Member</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Fill in the details below. The profile will appear on the public team section.
        </p>
      </div>

      <TeamMemberForm />
    </div>
  );
}
