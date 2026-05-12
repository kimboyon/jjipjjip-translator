import { signOut } from "@/app/actions/auth";
import { AdminCharts } from "@/components/AdminCharts";
import { isAdminEmail } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { formatDate, initials } from "@/lib/format";
import { BarChart3, FileText, Home, LogOut, MessageSquareText, Settings, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

function lastSevenDays() {
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?message=로그인이 필요합니다.");
  if (!isAdminEmail(user.email)) redirect("/community");

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const [{ count: visitorCount }, { count: userCount }, { count: postCount }, { count: replyCount }, { data: profiles }, { data: posts }, { data: views }] =
    await Promise.all([
      supabase.from("page_views").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("replies").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(25),
      supabase.from("posts").select("id, author_id, category, created_at").order("created_at", { ascending: false }).limit(500),
      supabase.from("page_views").select("created_at").gte("created_at", weekStart.toISOString())
    ]);

  const viewsByDay = lastSevenDays().map((date) => {
    const key = date.toISOString().slice(0, 10);
    return {
      day: `${date.getMonth() + 1}/${date.getDate()}`,
      count: views?.filter((view) => view.created_at.slice(0, 10) === key).length ?? 0
    };
  });

  const categories = ["질문", "후기", "자유", "공지", "상담"];
  const postsByCategory = categories.map((category) => ({
    category: category.replace(" & ", " / "),
    count: posts?.filter((post) => post.category === category).length ?? 0
  }));

  const postCountByUser = new Map<string, number>();
  posts?.forEach((post) => {
    postCountByUser.set(post.author_id, (postCountByUser.get(post.author_id) ?? 0) + 1);
  });
  const navItems: { label: string; href: string; icon: LucideIcon }[] = [
    { label: "대시보드", href: "/admin", icon: Home },
    { label: "회원 관리", href: "/admin", icon: Users },
    { label: "상담 관리", href: "/admin", icon: MessageSquareText },
    { label: "게시글 관리", href: "/community", icon: FileText },
    { label: "통계", href: "/admin", icon: BarChart3 },
    { label: "설정", href: "/admin", icon: Settings }
  ];

  return (
    <main className="min-h-screen bg-ink p-3 md:p-6">
      <section className="grid min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-md bg-paper shadow-velvet lg:grid-cols-[230px_1fr]">
        <aside className="bg-[linear-gradient(155deg,#07130f,#10261f_58%,#050907)] p-7 text-ivory">
          <Link href="/" className="flex items-center gap-3 font-serif">
            <span className="text-2xl text-gold">맨업</span>
            <span className="text-sm">관리자</span>
          </Link>
          <nav className="mt-10 space-y-2 text-sm">
            {navItems.map(({ label, href, icon: Icon }, index) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded px-3 py-3 ${index === 0 ? "bg-white/10" : "text-ivory/75"}`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>
          <form action={signOut} className="mt-16">
            <button className="flex items-center gap-3 rounded border border-ivory/15 px-3 py-3 text-sm text-ivory/80">
              <LogOut size={15} /> 로그아웃
            </button>
          </form>
        </aside>
        <div className="p-5 md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1 className="text-4xl font-black text-ink">관리자 대시보드</h1>
              <p className="mt-2 text-sm text-ink/55">방문자, 가입자, 상담, 게시글 현황을 확인합니다.</p>
            </div>
            <div className="rounded border border-ink/10 bg-white/70 px-4 py-3 text-xs text-ink/60">
              {formatDate(new Date().toISOString())}
            </div>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["방문자", visitorCount ?? 0, "+12.4%"],
              ["가입자", userCount ?? 0, "+8.7%"],
              ["상담 신청", replyCount ?? 0, "+15.3%"],
              ["게시글", postCount ?? 0, "+9.1%"]
            ].map(([label, value, delta], index) => (
              <section key={String(label)} className="admin-panel">
                <div className="flex items-center justify-between text-sm text-ink/55">
                  <span>{String(label)}</span>
                  <span className="text-gold">{index + 1}</span>
                </div>
                <p className="mt-4 font-serif text-4xl text-ink">{Number(value).toLocaleString()}</p>
                <p className="mt-3 text-xs text-moss">{String(delta)} 지난 주 대비</p>
              </section>
            ))}
          </div>
          <div className="mt-5">
            <AdminCharts views={viewsByDay} posts={postsByCategory} />
          </div>
          <section className="admin-panel mt-5">
            <div className="flex flex-col justify-between gap-4 border-b border-ink/10 pb-4 md:flex-row md:items-center">
              <h2 className="text-sm font-semibold text-ink">사용자 관리</h2>
              <input className="velora-input max-w-sm py-2 text-xs" placeholder="사용자 검색" />
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.14em] text-ink/45">
                  <tr>
                    <th className="py-3">이름</th>
                    <th>이메일</th>
                    <th>게시글 수</th>
                    <th>상태</th>
                    <th>최근 활동</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {profiles?.map((profile) => (
                    <tr key={profile.id}>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-moss text-xs text-white">
                            {initials(profile.display_name, profile.email)}
                          </span>
                          <span>{profile.display_name ?? "맨업 멤버"}</span>
                        </div>
                      </td>
                      <td className="text-ink/60">{profile.email}</td>
                      <td>{postCountByUser.get(profile.id) ?? 0}</td>
                      <td>
                        <span className="rounded-full bg-jade/20 px-2 py-1 text-xs text-moss">활성</span>
                      </td>
                      <td className="text-ink/50">{formatDate(profile.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
