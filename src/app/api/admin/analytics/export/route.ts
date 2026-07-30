import { NextResponse } from "next/server";
import { verifyToken, getAuthToken } from "@/lib/auth";
import sql from "@/lib/db";

function checkAuth(request: Request): string | null {
  let token = getAuthToken(request);
  // Fallback: accept token as query parameter (for direct links)
  if (!token) {
    const url = new URL(request.url);
    token = url.searchParams.get("token") || null;
  }
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: Request) {
  const auth = checkAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "events"; // events, applications
    const period = url.searchParams.get("period") || "month";

    let dateFilter = "";
    if (period === "week") {
      dateFilter = "WHERE created_at >= NOW() - INTERVAL '7 days'";
    } else if (period === "month") {
      dateFilter = "WHERE created_at >= NOW() - INTERVAL '30 days'";
    } else if (period === "quarter") {
      dateFilter = "WHERE created_at >= NOW() - INTERVAL '90 days'";
    } else if (period === "year") {
      dateFilter = "WHERE created_at >= NOW() - INTERVAL '365 days'";
    }

    let csv = "";
    let filename = "";

    if (type === "events") {
      const rows = await sql(`SELECT * FROM analytics_events ${dateFilter} ORDER BY created_at DESC`);
      csv = [
        "id,event_type,event_data,page_url,referrer,utm_source,utm_medium,utm_campaign,created_at",
        ...rows.map((r: any) =>
          `${r.id},"${r.event_type}","${(r.event_data || "").replace(/"/g, '""')}","${(r.page_url || "").replace(/"/g, '""')}","${(r.referrer || "").replace(/"/g, '""')}","${(r.utm_source || "").replace(/"/g, '""')}","${(r.utm_medium || "").replace(/"/g, '""')}","${(r.utm_campaign || "").replace(/"/g, '""')}","${r.created_at}"`
        ),
      ].join("\n");
      filename = "analytics_events.csv";
    } else if (type === "applications") {
      const rows = await sql(`SELECT * FROM applications ${dateFilter} ORDER BY created_at DESC`);
      csv = [
        "id,name,phone,email,product,message,status,created_at",
        ...rows.map((r: any) =>
          `${r.id},"${(r.name || "").replace(/"/g, '""')}","${(r.phone || "").replace(/"/g, '""')}","${(r.email || "").replace(/"/g, '""')}","${(r.product || "").replace(/"/g, '""')}","${(r.message || "").replace(/"/g, '""')}","${r.status}","${r.created_at}"`
        ),
      ].join("\n");
      filename = "applications.csv";
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
