import { signOut } from "@/app/actions/auth";
import { AdminCharts } from "@/components/AdminCharts";
import { isAdminEmail } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { formatDate, initials } from "@/lib/format";
import { BarChart3, FileText, Home, LogOut, Settings, Users, type LucideIcon } from "lucide-react";
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

  if (!user) redirect("/login?message=Please sign in first.");
  if (!isAdminEmail(user.email)) redirect("/community");

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const [{ count: visitorCount }, { count: userCount }, { count: postCount }, { data: profiles }, { data: posts }, { data: views }] =
    await Promise.all([
      supabase.from("page_views").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }),
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

  const categories = ["Care & Materials", "Styling", "Orders & Shipping", "Products", "Events"];
  const postsByCategory = categories.map((category) => ({
    category: category.replace(" & ", " / "),
    count: posts?.filter((post) => post.category === category).length ?? 0
  }));

  const postCountByUser = new Map<string, number>();
  posts?.forEach((post) => {
    postCountByUser.set(post.author_id, (postCountByUser.get(post.author_id) ?? 0) + 1);
  });
  const navItems: { label: string; href: string; icon: LucideIcon }[] = [
    { label: "Overview", href: "/admin", icon: Home },
    { label: "Community", href: "/community", icon: FileText },
    { label: "Customers", href: "/admin", icon: Users },
    { label: "Analytics", href: "/admin", icon: BarChart3 },
    { label: "Settings", href: "/admin", icon: Settings }
  ];

  return (
    <main className="min-h-screen bg-ink p-3 md:p-6">
      <section className="grid min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-md bg-paper shadow-velvet lg:grid-cols-[230px_1fr]">
        <aside className="bg-[linear-gradient(155deg,#541f22,#321415_58%,#160d0d)] p-7 text-ivory">
          <Link href="/" className="flex items-center gap-3 font-serif tracking-[0.32em]">
            <span className="text-2xl text-gold">V</span>
            <span className="text-sm">VELORA ADMIN</span>
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
              <LogOut size={15} /> Logout
            </button>
          </form>
        </aside>
        <div className="p-5 md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1 className="font-serif text-4xl text-ink">Overview</h1>
              <p className="mt-2 text-sm text-ink/55">Key performance metrics and recent activity.</p>
            </div>
            <div className="rounded border border-ink/10 bg-white/70 px-4 py-3 text-xs text-ink/60">
              {formatDate(new Date().toISOString())}
            </div>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              ["Visitors", visitorCount ?? 0, "+18.7%"],
              ["Members", userCount ?? 0, "+8.9%"],
              ["Posts", postCount ?? 0, "+12.4%"]
            ].map(([label, value, delta]) => (
              <section key={String(label)} className="admin-panel">
                <div className="flex items-center justify-between text-sm text-ink/55">
                  <span>{String(label)}</span>
                  <span className="text-gold">$</span>
                </div>
                <p className="mt-4 font-serif text-4xl text-ink">{Number(value).toLocaleString()}</p>
                <p className="mt-3 text-xs text-moss">{String(delta)} vs previous period</p>
              </section>
            ))}
          </div>
          <div className="mt-5">
            <AdminCharts views={viewsByDay} posts={postsByCategory} />
          </div>
          <section className="admin-panel mt-5">
            <div className="flex flex-col justify-between gap-4 border-b border-ink/10 pb-4 md:flex-row md:items-center">
              <h2 className="text-sm font-semibold text-ink">User Management</h2>
              <input className="velora-input max-w-sm py-2 text-xs" placeholder="Search customers..." />
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.14em] text-ink/45">
                  <tr>
                    <th className="py-3">Customer</th>
                    <th>Email</th>
                    <th>Posts</th>
                    <th>Status</th>
                    <th>Joined</th>
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
                          <span>{profile.display_name ?? "Velora Member"}</span>
                        </div>
                      </td>
                      <td className="text-ink/60">{profile.email}</td>
                      <td>{postCountByUser.get(profile.id) ?? 0}</td>
                      <td>
                        <span className="rounded-full bg-jade/20 px-2 py-1 text-xs text-moss">Active</span>
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
