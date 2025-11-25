import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { type IStrategy } from "@/types";

interface StrategyDetailsProps {
  strategy: IStrategy;
}

const StrategyDetails: React.FC<StrategyDetailsProps> = ({ strategy }) => {
  if (!strategy) {
    return null;
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Strategy Details</DialogTitle>
        <DialogDescription>
          Detailed information about the selected strategy.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-3 items-center gap-4">
          <span className="text-sm font-medium text-gray-500">Date:</span>
          <span className="col-span-2">
            {new Date(strategy.date).toLocaleDateString()}
          </span>
        </div>
        <div className="grid grid-cols-1 items-start gap-4">
          <span className="text-sm font-medium text-gray-500">Content:</span>
          <div className="col-span-2 max-h-80 overflow-y-auto whitespace-pre-wrap">
            {strategy.content}
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default StrategyDetails;
