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
    const period = url.searchParams.get("period") || "month"; // day, week, month, quarter, year, all
    const eventType = url.searchParams.get("event") || ""; // filter by event type
    const dateFrom = url.searchParams.get("from") || ""; // custom date range
    const dateTo = url.searchParams.get("to") || "";

    // Build date filter
    let dateFilter = "";
    if (dateFrom && dateTo) {
      dateFilter = `AND created_at >= '${dateFrom}'::timestamp AND created_at <= '${dateTo}'::timestamp + INTERVAL '1 day'`;
    } else if (dateFrom) {
      dateFilter = `AND created_at >= '${dateFrom}'::timestamp`;
    } else if (dateTo) {
      dateFilter = `AND created_at <= '${dateTo}'::timestamp + INTERVAL '1 day'`;
    } else if (period === "day") {
      dateFilter = "AND created_at >= NOW() - INTERVAL '1 day'";
    } else if (period === "week") {
      dateFilter = "AND created_at >= NOW() - INTERVAL '7 days'";
    } else if (period === "month") {
      dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
    } else if (period === "quarter") {
      dateFilter = "AND created_at >= NOW() - INTERVAL '90 days'";
    } else if (period === "year") {
      dateFilter = "AND created_at >= NOW() - INTERVAL '365 days'";
    }

    let typeFilter = "";
    let typeParams: string[] = [];
    if (eventType) {
      typeFilter = "AND event_type = $1";
      typeParams = [eventType];
    }

    // Helper to run query with or without params
    const q = async (query: string, params?: string[]) => {
      const allParams = [...(typeParams || []), ...(params || [])];
      return sql(query, allParams.length > 0 ? allParams : undefined);
    };

    // Total events count by type
    const byType = await q(`
      SELECT event_type, COUNT(*)::int as count
      FROM analytics_events
      WHERE 1=1 ${dateFilter} ${typeFilter}
      GROUP BY event_type
      ORDER BY count DESC
    `);

    // Events by day
    const byDay = await q(`
      SELECT DATE(created_at) as day, event_type, COUNT(*)::int as count
      FROM analytics_events
      WHERE 1=1 ${dateFilter} ${typeFilter}
      GROUP BY DATE(created_at), event_type
      ORDER BY day ASC
    `);

    // Events by hour of day (0-23) - for heatmap
    const byHourOfDay = await q(`
      SELECT EXTRACT(HOUR FROM created_at)::int as hour, event_type, COUNT(*)::int as count
      FROM analytics_events
      WHERE 1=1 ${dateFilter} ${typeFilter}
      GROUP BY EXTRACT(HOUR FROM created_at), event_type
      ORDER BY hour ASC
    `);

    // Events by day of week
    const byDayOfWeek = await q(`
      SELECT EXTRACT(DOW FROM created_at)::int as dow, 
             TO_CHAR(created_at, 'Day') as day_name,
             event_type, COUNT(*)::int as count
      FROM analytics_events
      WHERE 1=1 ${dateFilter} ${typeFilter}
      GROUP BY EXTRACT(DOW FROM created_at), TO_CHAR(created_at, 'Day'), event_type
      ORDER BY dow ASC
    `);

    // Product/Service click stats
    const byProduct = await q(`
      SELECT event_data, COUNT(*)::int as count
      FROM analytics_events
      WHERE event_type IN ('click_product', 'click_service') ${dateFilter}
      GROUP BY event_data
      ORDER BY count DESC
      LIMIT 30
    `);

    // Application product stats
    const appProducts = await q(`
      SELECT product, COUNT(*)::int as count
      FROM applications
      WHERE 1=1 ${dateFilter.replaceAll('created_at', 'applications.created_at')}
      GROUP BY product
      ORDER BY count DESC
      LIMIT 30
    `);

    // Application status stats
    const appStatuses = await q(`
      SELECT status, COUNT(*)::int as count
      FROM applications
      GROUP BY status
      ORDER BY count DESC
    `);

    // Applications by day
    const appsByDay = await q(`
      SELECT DATE(created_at) as day, COUNT(*)::int as count
      FROM applications
      WHERE 1=1 ${dateFilter.replaceAll('created_at', 'applications.created_at')}
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `);

    // Phone clicks stats
    const phoneClicks = await q(`
      SELECT event_data, COUNT(*)::int as count
      FROM analytics_events
      WHERE event_type = 'click_phone' ${dateFilter}
      GROUP BY event_data
      ORDER BY count DESC
    `);

    // UTM source + medium + campaign combined
    const utmStats = await q(`
      SELECT 
        COALESCE(NULLIF(utm_source, ''), 'direct') as source,
        COALESCE(NULLIF(utm_medium, ''), 'none') as medium,
        COALESCE(NULLIF(utm_campaign, ''), '-') as campaign,
        COUNT(*)::int as count
      FROM analytics_events
      WHERE 1=1 ${dateFilter}
      GROUP BY source, medium, campaign
      ORDER BY count DESC
      LIMIT 30
    `);

    // Top referrers
    const topReferrers = await q(`
      SELECT 
        COALESCE(NULLIF(referrer, ''), '(direct)') as referrer,
        COUNT(*)::int as count
      FROM analytics_events
      WHERE 1=1 ${dateFilter}
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 15
    `);

    // Page views stats
    const pageViews = await q(`
      SELECT page_url, COUNT(*)::int as count
      FROM analytics_events
      WHERE event_type = 'page_view' ${dateFilter}
      GROUP BY page_url
      ORDER BY count DESC
      LIMIT 10
    `);

    // Total counts
    const total = await q(`
      SELECT COUNT(*) as total FROM analytics_events
    `);

    const today = await q(`
      SELECT COUNT(*) as today FROM analytics_events
      WHERE created_at >= CURRENT_DATE
    `);

    // Weekly comparison (this week vs last week)
    const thisWeek = await q(`
      SELECT COUNT(*)::int as count FROM analytics_events
      WHERE created_at >= DATE_TRUNC('week', NOW()) AND created_at < NOW()
    `);
    const lastWeek = await q(`
      SELECT COUNT(*)::int as count FROM analytics_events
      WHERE created_at >= DATE_TRUNC('week', NOW()) - INTERVAL '7 days'
        AND created_at < DATE_TRUNC('week', NOW())
    `);

    return NextResponse.json({
      total: parseInt(total[0]?.total || "0"),
      today: parseInt(today[0]?.today || "0"),
      thisWeek: parseInt(thisWeek[0]?.count || "0"),
      lastWeek: parseInt(lastWeek[0]?.count || "0"),
      byType,
      byDay,
      byHourOfDay,
      byDayOfWeek,
      byProduct,
      appProducts,
      appStatuses,
      appsByDay,
      phoneClicks,
      utmStats,
      topReferrers,
      pageViews,
    });
  } catch (e: any) {
    console.error("Analytics API error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
