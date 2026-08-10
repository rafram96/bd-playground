import CourseShell from "@/components/layout/CourseShell";

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return <CourseShell>{children}</CourseShell>;
}
