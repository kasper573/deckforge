import { useEffect, useState } from "react";

export function useObjectUrl(blob?: Blob) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      setUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [blob]);

  return url;
}
