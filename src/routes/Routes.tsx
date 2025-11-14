import React, { Suspense, lazy } from "react";
import Layout from "../components/dashboard/layout";
import { Skeleton } from "../components/ui/skeleton";

// Lazy load all the page components
const Landing = lazy(() => import("../Pages/landing/Landing"));
const HomePage = lazy(() => import("../Pages/home/home"));
const SetBalancePage = lazy(() => import("../Pages/balance/funds"));
const NewPair = lazy(() => import("../Pages/pairs/NewPairs"));
const PnlPage = lazy(() => import("../Pages/pnl/page"));
const TradingPage = lazy(() => import("../Pages/trading/TradingPage"));
const ComingSoon = lazy(() => import("../Pages/comingSoon/coming"));
const SettingPage = lazy(() => import("../Pages/setting/settings"));
const DocsPage = lazy(() => import("../Pages/docs/docs"));
const NotFound = lazy(() => import("../not-found"));

// A simple loading component to show while pages are loading
const PageLoader = () => (
  <div className="w-full h-screen p-6">
    <Skeleton className="h-24 w-full mb-4" />
    <div className="space-y-2">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  </div>
);

const appRoutes = [
  {
    path: "*",
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFound />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Landing />
      </Suspense>
    ),
  },
  {
    path: "/home", // Explicitly define home route
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <HomePage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/funds",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <SetBalancePage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/trade",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <NewPair />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/pnl",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <PnlPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/trading/:id",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <TradingPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/swaps",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <ComingSoon />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/settings",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <SettingPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/docs",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <DocsPage />
        </Suspense>
      </Layout>
    ),
  },
];

export default appRoutes;
