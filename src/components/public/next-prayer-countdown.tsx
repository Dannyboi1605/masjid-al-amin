"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatCountdown } from "@/lib/time";

type Props = {
  targetIso: string;
  initialLabel: string;
  className?: string;
};

export function NextPrayerCountdown({
  targetIso,
  initialLabel,
  className = "text-base text-putih/85 tnum",
}: Props) {
  const router = useRouter();
  const refreshed = useRef(false);
  const [label, setLabel] = useState(initialLabel);

  useEffect(() => {
    const target = new Date(targetIso);
    const update = () => {
      const current = new Date();
      setLabel(formatCountdown(target, current));

      if (target.getTime() <= current.getTime() && !refreshed.current) {
        refreshed.current = true;
        router.refresh();
      }
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [targetIso, router]);

  return (
    <span aria-live="off" className={className}>
      {label}
    </span>
  );
}
