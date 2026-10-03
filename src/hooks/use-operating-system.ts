import { useEffect, useState } from "react";

type OperatingSystem = "mac" | "windows" | "linux" | "other";

export function useOperatingSystem() {
  const [os, setOs] = useState<OperatingSystem>("other");

  useEffect(() => {
    const platform = navigator.userAgent.toLowerCase();

    if (platform.includes("mac")) {
      setOs("mac");
    } else if (platform.includes("win")) {
      setOs("windows");
    } else if (platform.includes("linux")) {
      setOs("linux");
    }
  }, []);

  return os;
}
