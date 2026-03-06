import { Skeleton } from "@/components/ui/skeleton";

export default function WargaLoading() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-36 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-10 rounded-lg" />
    </div>
  );
}
