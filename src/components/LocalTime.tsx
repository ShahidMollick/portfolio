"use client";

import { useEffect, useState } from "react";

const ZONE = "Asia/Kolkata";

// The studio's local time, so visitors anywhere can see when you're working.
export default function LocalTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, hour: "2-digit", minute: "2-digit" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  // empty until mounted, so the server and client render the same thing
  return <span suppressHydrationWarning>India {time && `— ${time} IST`}</span>;
}
