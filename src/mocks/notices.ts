import { addDays } from "date-fns";
import type { Announcement, DeviceSession, ExamSitting, StaffDocument } from "@/types/domain";

export function buildAnnouncements(now: Date): Announcement[] {
  return [
    {
      id: "msg-meeting",
      title: "Staff meeting moved to Thursday",
      body: "The Thursday staff meeting will start at 15:10 in the seminar room. Bring your Grade 8 mark book if you have one on paper.",
      sender: "School office",
      sentAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      category: "announcement",
      unread: true,
    },
    {
      id: "msg-excursion",
      title: "Grade 8 excursion consent",
      body: "Consent forms for the Grade 8 excursion are due with the office on Friday. Teachers do not collect fees for this trip.",
      sender: "Principal’s office",
      sentAt: addDays(now, -1).toISOString(),
      category: "announcement",
      unread: true,
    },
    {
      id: "msg-drill",
      title: "Fire drill at 11:40",
      body: "A fire drill is scheduled this week. Leave bags in the room and walk your class to the front court.",
      sender: "School office",
      sentAt: addDays(now, -3).toISOString(),
      category: "announcement",
      unread: false,
    },
    {
      id: "msg-cover",
      title: "Cover note for Grade 6 A",
      body: "Please leave the angle worksheet on the desk if you are away. This alert is a design fixture.",
      sender: "Academic office",
      sentAt: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
      category: "alert",
      unread: true,
      href: "/app/homework/hw-angles",
    },
  ];
}

export function buildExams(now: Date): ExamSitting[] {
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 2, 9, 0, 0);
  const dayAfter = addDays(nextMonth, 1);
  return [
    {
      id: "exam-8a",
      examName: "Term 1",
      gradeLabel: "Grade 8",
      section: "A",
      subject: "Mathematics",
      startsAt: nextMonth.toISOString(),
      room: "Hall B",
      entryOpen: false,
    },
    {
      id: "exam-7b",
      examName: "Term 1",
      gradeLabel: "Grade 7",
      section: "B",
      subject: "Mathematics",
      startsAt: dayAfter.toISOString(),
      room: "Hall B",
      entryOpen: false,
    },
  ];
}

export const HOLIDAYS: Record<string, string> = {
  "2026-10-02": "Gandhi Jayanti",
};

export const DOCUMENTS: StaffDocument[] = [
  {
    id: "doc-appointment",
    name: "Appointment letter",
    type: "Appointment",
    status: "VERIFIED",
  },
  {
    id: "doc-id",
    name: "Staff identity card",
    type: "Identity",
    status: "VERIFIED",
  },
];

export const DEVICES: DeviceSession[] = [
  {
    id: "device-current",
    device: "This browser",
    lastSeen: "Now",
    current: true,
  },
  {
    id: "device-phone",
    device: "iPhone · Safari",
    lastSeen: "Yesterday, 21:14",
    current: false,
  },
];
