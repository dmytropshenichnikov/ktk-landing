"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRedirect() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      router.push("/adminpanel/dashboard");
    } else {
      router.push("/adminpanel/login");
    }
  }, [router]);
  return <p style={{ padding: 40, textAlign: "center" }}>Перенаправлення...</p>;
}
