import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/pricing",
    "/features",
    "/how-it-works",
    "/security",
    "/enterprise",
    "/contact",
    "/api/billing/webhook",
    "/api/clerk/webhook",
  ],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
