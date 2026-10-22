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
  "2026-01-01": "New Year's Day",
  "2026-01-14": "Makar Sankranti",
  "2026-01-23": "Basant Panchami",
  "2026-01-26": "Republic Day",
  "2026-02-15": "Maha Shivratri",
  "2026-03-03": "Holika Dahan",
  "2026-03-04": "Holi",
  "2026-03-19": "Ugadi",
  "2026-03-21": "Id-ul-Fitr",
  "2026-03-26": "Ram Navami",
  "2026-03-31": "Mahavir Jayanti",
  "2026-04-03": "Good Friday",
  "2026-04-14": "Ambedkar Jayanti",
  "2026-05-01": "Buddha Purnima",
  "2026-05-27": "Id-ul-Zuha",
  "2026-06-26": "Muharram",
  "2026-08-15": "Independence Day",
  "2026-08-26": "Milad-un-Nabi",
  "2026-08-28": "Raksha Bandhan",
  "2026-09-04": "Janmashtami",
  "2026-09-14": "Ganesh Chaturthi",
  "2026-10-02": "Gandhi Jayanti",
  "2026-10-11": "Sharad Navratri",
  "2026-10-17": "Durga Puja",
  "2026-10-18": "Maha Saptami",
  "2026-10-19": "Maha Ashtami",
  "2026-10-20": "Dussehra",
  "2026-10-26": "Valmiki Jayanti",
  "2026-10-29": "Karwa Chauth",
  "2026-11-08": "Diwali",
  "2026-11-09": "Govardhan Puja",
  "2026-11-11": "Bhai Duj",
  "2026-11-15": "Chhath Puja",
  "2026-11-24": "Guru Nanak Jayanti",
  "2026-12-25": "Christmas",
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
