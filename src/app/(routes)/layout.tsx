import { GlobalProvider } from "@/components/provider/global";

export default function RouteLayout(props: LayoutProps<"/">) {
  return <GlobalProvider>{props.children}</GlobalProvider>;
}
