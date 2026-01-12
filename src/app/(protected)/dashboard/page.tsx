import { SubscriptionEntitlementQuery } from "@/convex/query.config";
import { combinedSlug } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { profileName } = await SubscriptionEntitlementQuery();

  if (!profileName) {
    redirect("/auth/sign-in");
  }

  // Skip billing check for now (Q8: C)
  // if (!entitlement?._valueJSON) {
  //   redirect(`/billing/${combinedSlug(profileName)}`)
  // }

  redirect(`/dashboard/${combinedSlug(profileName)}`);
}