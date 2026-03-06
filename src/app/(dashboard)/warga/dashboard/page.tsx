import { getBillingStatus, getKasBalance, getWargaProfile } from "@/server/actions/warga-dashboard";

import { BillingStatusCard } from "./_components/billing-status-card";
import { GreetingHeader } from "./_components/greeting-header";
import { KasBalanceCard } from "./_components/kas-balance-card";
import { QuickActions } from "./_components/quick-actions";

export default async function WargaDashboardPage() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [profile, balance] = await Promise.all([getWargaProfile(), getKasBalance()]);

  const billingItems = profile ? await getBillingStatus(currentMonth, currentYear) : [];

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
      <GreetingHeader profile={profile} />
      <KasBalanceCard balance={balance} />
      <BillingStatusCard items={billingItems} month={currentMonth} year={currentYear} />
      <QuickActions />
    </div>
  );
}
