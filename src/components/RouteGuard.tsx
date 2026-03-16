"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function RouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const isAuthPage = pathname === "/login" || pathname === "/signup";
    const loggedInUser = localStorage.getItem("careerflow_logged_in_user");

    if (!loggedInUser && !isAuthPage) {
      router.replace("/login");
      return;
    }

    if (loggedInUser && isAuthPage) {
      router.replace("/dashboard");
      return;
    }

    setCheckingAuth(false);
  }, [pathname, router]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}