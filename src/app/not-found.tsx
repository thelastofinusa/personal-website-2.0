import { GlobalProvider } from "@/components/provider/global";
import { NotFoundComp } from "@/components/shared/not-found";

export default function NotFound() {
  return (
    <GlobalProvider>
      <NotFoundComp />
    </GlobalProvider>
  );
}
