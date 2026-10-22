"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ACADEMIC_YEAR_LABEL } from "@/config/app";
import { ASSIGNMENTS } from "@/mocks/fixture";
import { getPortalRepository } from "@/repositories";

export function ProfilePage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: () => getPortalRepository().getProfile(),
  });
  const [phone, setPhone] = useState<string | null>(null);
  const profile = query.data;
  const phoneValue = phone ?? profile?.phone ?? "";

  const savePhone = useMutation({
    mutationFn: () => getPortalRepository().updatePhone(phoneValue),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Phone updated in this browser only. Not saved to the school.");
      setPhone(null);
    },
  });

  const savePhoto = useMutation({
    mutationFn: (dataUrl: string) => getPortalRepository().updatePhoto(dataUrl),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Photo updated in this browser only. Not saved to the school.");
    },
  });

  if (!profile) return <p className="text-sm text-muted-foreground">Loading profile…</p>;

  return (
    <PageContainer title="Profile" description="The employment record in this demonstration. The school record is not connected.">
      <Card>
        <CardContent className="flex items-center gap-4">
          <Avatar name={profile.displayName} src={profile.photoUrl} className="h-16 w-16 text-base" />
          <div>
            <h2 className="text-xl font-semibold">{profile.displayName}</h2>
            <p className="text-sm text-muted-foreground">{profile.designation}</p>
            <Badge variant="success" className="mt-2">{profile.status}</Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Employee number" value={profile.employeeNumber} />
          <Field label="Email" value={profile.email} />
          <Field label="Joining date" value={profile.joiningDate} />
          <Field label="Department" value={`${profile.department} · Primary`} />
          <Field label="Academic year" value={ACADEMIC_YEAR_LABEL} />
          <Field label="Qualification" value="M.Sc. Mathematics · sample" />
          <Field label="Experience" value="Since 10 June 2019" />
          <Field label="Emergency contact" value="School office only · not a private number" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3">
          <Input label="Phone" value={phoneValue} onChange={(event) => setPhone(event.target.value)} />
          <p className="text-xs text-muted-foreground">Your school changes the login email.</p>
          <Button disabled={savePhone.isPending || phoneValue === profile.phone} onClick={() => savePhone.mutate()}>
            Save phone
          </Button>
          <label className="inline-flex cursor-pointer text-sm font-medium text-brand">
            Change photo
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === "string") savePhoto.mutate(reader.result);
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3">
          <h2 className="font-semibold">My documents</h2>
          {profile.documents.map((document) => (
            <div key={document.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{document.name}</p>
                <p className="text-xs text-muted-foreground">{document.type}</p>
              </div>
              <Badge variant="success">Verified</Badge>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Downloads are not connected to the school file store.</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-2">
          <h2 className="font-semibold">Teaching load</h2>
          {ASSIGNMENTS.map((assignment) => (
            <Link key={assignment.id} href={`/app/classes/${assignment.id}`} className="block text-sm font-medium text-brand">
              {assignment.gradeLabel} {assignment.section} · {assignment.subject}
            </Link>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
