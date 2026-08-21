import type { AttendanceRecord, AttendanceStatus } from "@/types";

export const attendanceSummary = {
  rate: 92,
  attended: 44,
  missed: 3,
  late: 2,
};

export const attendanceHistory: AttendanceRecord[] = [
  {
    id: "att_1",
    date: "Aug 6, 2026",
    className: "React Fundamentals",
    instructor: "Sarah Johnson",
    time: "2:00 PM",
    status: "present",
  },
  {
    id: "att_2",
    date: "Aug 5, 2026",
    className: "Async JavaScript",
    instructor: "Daniel Okafor",
    time: "10:00 AM",
    status: "present",
  },
  {
    id: "att_3",
    date: "Aug 4, 2026",
    className: "Git Workflows",
    instructor: "Maya Patel",
    time: "1:30 PM",
    status: "late",
  },
  {
    id: "att_4",
    date: "Aug 3, 2026",
    className: "CSS Grid Lab",
    instructor: "Sarah Johnson",
    time: "9:00 AM",
    status: "present",
  },
  {
    id: "att_5",
    date: "Jul 31, 2026",
    className: "DOM Manipulation",
    instructor: "Daniel Okafor",
    time: "2:00 PM",
    status: "absent",
  },
  {
    id: "att_6",
    date: "Jul 30, 2026",
    className: "Responsive Design",
    instructor: "Maya Patel",
    time: "11:00 AM",
    status: "present",
  },
  {
    id: "att_7",
    date: "Jul 29, 2026",
    className: "JavaScript Functions",
    instructor: "Sarah Johnson",
    time: "2:00 PM",
    status: "present",
  },
  {
    id: "att_8",
    date: "Jul 28, 2026",
    className: "Flexbox Deep Dive",
    instructor: "Sarah Johnson",
    time: "9:00 AM",
    status: "late",
  },
];

/** Deterministic month grid statuses keyed by day-of-month. */
export function getMonthAttendance(year: number, month: number): Record<number, AttendanceStatus> {
  const days = new Date(year, month + 1, 0).getDate();
  const map: Record<number, AttendanceStatus> = {};
  for (let day = 1; day <= days; day++) {
    const weekday = new Date(year, month, day).getDay();
    if (weekday === 0 || weekday === 6) {
      map[day] = "none";
      continue;
    }
    const seed = (day * 7 + month * 3) % 20;
    if (seed === 4) map[day] = "absent";
    else if (seed === 9 || seed === 15) map[day] = "late";
    else map[day] = "present";
  }
  return map;
}
