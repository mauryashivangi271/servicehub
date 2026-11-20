import { AnalyticsDashboard } from "./AdminAnalytics";

export default function WorkerAnalytics({ showInventory = false }) {
  return (
    <AnalyticsDashboard expectedRole="worker" showInventory={showInventory} />
  );
}