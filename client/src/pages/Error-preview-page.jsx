import { useEffect } from "react";

function ErrorPreviewPage() {
  useEffect(() => {
    throw new Error("Previewing RouteRaksha 500 page");
  }, []);

  return null;
}

export default ErrorPreviewPage;
