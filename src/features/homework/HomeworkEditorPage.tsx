"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
import { ASSIGNMENTS } from "@/mocks/fixture";
import { getPortalRepository } from "@/repositories";

const homeworkSchema = z.object({
  title: z.string().min(1, "Title is required.").max(200),
  instructions: z.string().max(2000).optional(),
  assignmentId: z.string().min(1),
  dueAt: z.string().optional(),
});

export function HomeworkEditorPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [assignmentId, setAssignmentId] = useState(ASSIGNMENTS[0].id);
  const form = useForm<z.infer<typeof homeworkSchema>>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: { title: "", instructions: "", assignmentId: ASSIGNMENTS[0].id, dueAt: "" },
  });
  const mutation = useMutation({
    mutationFn: (publish: boolean) => {
      const values = form.getValues();
      const assignment = ASSIGNMENTS.find((item) => item.id === values.assignmentId);
      if (!assignment) throw new Error("Choose a class.");
      return getPortalRepository().createHomework({
        title: values.title,
        instructions: values.instructions ?? "",
        assignmentId: assignment.id,
        gradeLabel: assignment.gradeLabel,
        section: assignment.section,
        subject: assignment.subject,
        dueAt: values.dueAt ? new Date(values.dueAt).toISOString() : null,
        publish,
      });
    },
    onSuccess: async (task) => {
      await queryClient.invalidateQueries({ queryKey: ["homework"] });
      toast.success(
        task.status === "PUBLISHED"
          ? "Shown in this browser only. Not sent to the school."
          : "Draft kept in this browser only. Not sent to the school.",
      );
      router.push(`/app/homework/${task.id}`);
    },
  });

  return (
    <PageContainer title="New homework" description="Publishing here does not notify students or the school server.">
      <form className="max-w-xl space-y-4" onSubmit={form.handleSubmit(() => mutation.mutate(true))}>
        <Input label="Title" error={form.formState.errors.title?.message} {...form.register("title")} />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Instructions</span>
          <textarea className="min-h-32 rounded-lg border border-input bg-card px-3 py-2" {...form.register("instructions")} />
        </label>
        <Dropdown
          label="Class and section"
          value={assignmentId}
          onChange={(value) => {
            setAssignmentId(value);
            form.setValue("assignmentId", value);
          }}
          options={ASSIGNMENTS.map((item) => ({
            value: item.id,
            label: `${item.gradeLabel} ${item.section} · ${item.subject}`,
          }))}
        />
        <Input label="Due" type="datetime-local" {...form.register("dueAt")} />
        <div className="flex gap-2">
          <Button type="button" variant="secondary" disabled={mutation.isPending} onClick={form.handleSubmit(() => mutation.mutate(false))}>
            Save draft
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Publish"}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
