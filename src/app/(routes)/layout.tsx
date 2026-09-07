import { GlobalProvider } from "@/components/provider/global";
import { SanityLive } from "@/sanity/lib/live";

export default function RouteLayout(props: LayoutProps<"/">) {
  return (
    <GlobalProvider>
      {props.children}
      <SanityLive />
    </GlobalProvider>
  );
}
