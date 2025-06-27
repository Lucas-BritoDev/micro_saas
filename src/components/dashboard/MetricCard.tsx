import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  iconColor = "text-blue-500"
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1 md:mt-2 break-words">{value}</p>
          {change && (
            <p className={cn(
              "text-xs md:text-sm mt-1",
              changeType === "positive" && "text-green-600",
              changeType === "negative" && "text-red-600",
              changeType === "neutral" && "text-gray-500"
            )}>
              {change}
            </p>
          )}
        </div>
        <div className={cn("p-2 md:p-3 rounded-full bg-gray-50 flex-shrink-0 ml-3", iconColor)}>
          <Icon className="h-4 w-4 md:h-6 md:w-6" />
        </div>
      </div>
    </div>
  );
}
