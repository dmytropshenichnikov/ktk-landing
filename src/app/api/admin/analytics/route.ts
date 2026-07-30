import { NextResponse } from "next/server";
import { verifyToken, getAuthToken } from "@/lib/auth";
import sql from "@/lib/db";

function checkAuth(request: Request): boolean {
  const token = getAuthToken(request);
  if (!token) return false;
  return !!verifyToken(token);
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const period = url.searchParams.get("period") || "all"; // day, week, month, all
    const eventType = url.searchParams.get("event") || ""; // filter by event type

    let dateFilter = "";
    if (period === "day") {
      dateFilter = "AND created_at >= NOW() - INTERVAL '1 day'";
    } else if (period === "week") {
      dateFilter = "AND created_at >= NOW() - INTERVAL '7 days'";
    } else if (period === "month") {
      dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
    }

    let typeFilter = "";
    if (eventType) {
      typeFilter = "AND event_type = $1";
    }

    // Total events count by type
    const byType = await sql(`
      SELECT event_type, COUNT(*) as count
      FROM analytics_events
      WHERE 1=1 ${dateFilter} ${typeFilter}
      GROUP BY event_type
      ORDER BY count DESC
    `, eventType ? [eventType] : []);

    // Events by day (last 30 days)
    const byDay = await sql(`
      SELECT DATE(created_at) as day, event_type, COUNT(*) as count
      FROM analytics_events
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at), event_type
      ORDER BY day ASC
    `);

    // Events by hour (last 7 days)
    const byHour = await sql(`
      SELECT DATE_TRUNC('hour', created_at) as hour, event_type, COUNT(*) as count
      FROM analytics_events
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE_TRUNC('hour', created_at), event_type
      ORDER BY hour ASC
    `);

    // Product/Service click stats (last 30 days)
    const byProduct = await sql(`
      SELECT event_data, COUNT(*) as count
      FROM analytics_events
      WHERE event_type IN ('click_product', 'click_service')
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY event_data
      ORDER BY count DESC
      LIMIT 20
    `);

    // Application product stats
    const appProducts = await sql(`
      SELECT product, COUNT(*) as count
      FROM applications
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY product
      ORDER BY count DESC
      LIMIT 20
    `);

    // Application status stats
    const appStatuses = await sql(`
      SELECT status, COUNT(*) as count
      FROM applications
      GROUP BY status
      ORDER BY count DESC
    `);

    // Applications by day (last 30 days)
    const appsByDay = await sql(`
      SELECT DATE(created_at) as day, COUNT(*) as count
      FROM applications
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `);

    // Phone clicks stats
    const phoneClicks = await sql(`
      SELECT event_data, COUNT(*) as count
      FROM analytics_events
      WHERE event_type = 'click_phone'
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY event_data
      ORDER BY count DESC
    `);

    // UTM source stats
    const utmStats = await sql(`
      SELECT 
        COALESCE(NULLIF(utm_source, ''), 'direct') as source,
        COUNT(*) as count
      FROM analytics_events
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY source
      ORDER BY count DESC
    `);

    // Total counts
    const total = await sql(`
      SELECT COUNT(*) as total FROM analytics_events
    `);

    const today = await sql(`
      SELECT COUNT(*) as today FROM analytics_events
      WHERE created_at >= CURRENT_DATE
    `);

    return NextResponse.json({
      total: parseInt(total[0]?.total || "0"),
      today: parseInt(today[0]?.today || "0"),
      byType,
      byDay,
      byHour,
      byProduct,
      appProducts,
      appStatuses,
      appsByDay,
      phoneClicks,
      utmStats,
    });
  } catch (e: any) {
    console.error("Analytics API error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
