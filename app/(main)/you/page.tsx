import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DirectionalTransition from "@/components/transitions/DirectionalTransition";
import YouView from "@/components/you/YouView";
import SignedOutView from "@/components/you/SignedOutView";

export const metadata: Metadata = {
  title: "You - Reelora",
};

export default async function YouPage() {
  const session = await getServerSession(authOptions);

  return (
    <DirectionalTransition>
      {session?.user?.id ? (
        <YouView userId={session.user.id} />
      ) : (
        <SignedOutView />
      )}
    </DirectionalTransition>
  );
}
