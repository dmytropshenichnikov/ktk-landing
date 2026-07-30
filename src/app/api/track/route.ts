import { NextResponse } from "next/server";
import sql from "@/lib/db";

type TrackPayload = {
  event_type: string;
  event_data?: string;
  page_url?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

const ALLOWED_EVENTS = [
  "click_phone",
  "click_viber",
  "click_whatsapp",
  "click_product",
  "click_service",
  "submit_application",
  "page_view",
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TrackPayload;

    if (!body.event_type || !ALLOWED_EVENTS.includes(body.event_type)) {
      return NextResponse.json({ error: "Invalid event_type" }, { status: 400 });
    }

    // Get IP and User-Agent from headers
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || "";
    const ua = request.headers.get("user-agent") || "";

    try {
      await sql(`INSERT INTO analytics_events 
        (event_type, event_data, page_url, referrer, utm_source, utm_medium, utm_campaign, user_agent, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          body.event_type,
          body.event_data || "",
          body.page_url || "",
          body.referrer || "",
          body.utm_source || "",
          body.utm_medium || "",
          body.utm_campaign || "",
          ua,
          ip,
        ]);
    } catch (dbError) {
      console.error("Track DB error:", dbError);
      // Non-fatal
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
