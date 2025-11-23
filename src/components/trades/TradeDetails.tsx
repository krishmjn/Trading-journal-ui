import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { type ITrade } from "@/types";

interface TradeDetailsProps {
  trade: ITrade;
}

const TradeDetails: React.FC<TradeDetailsProps> = ({ trade }) => {
  if (!trade) {
    return null;
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Trade Details</DialogTitle>
        <DialogDescription>
          Detailed information about the selected trade.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-3 items-center gap-4">
          <span className="text-sm font-medium text-gray-500">Date:</span>
          <span className="col-span-2">
            {new Date(trade.date).toLocaleDateString()}
          </span>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <span className="text-sm font-medium text-gray-500">Reason:</span>
          <span className="col-span-2">{trade.reason}</span>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <span className="text-sm font-medium text-gray-500">Status:</span>
          <span className="col-span-2">{trade.status}</span>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <span className="text-sm font-medium text-gray-500">Entry Price:</span>
          <span className="col-span-2">{trade.entryPrice}</span>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <span className="text-sm font-medium text-gray-500">Quantity:</span>
          <span className="col-span-2">{trade.quantity}</span>
        </div>
        {trade.profitLoss !== undefined && (
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-gray-500">P/L:</span>
            <span
              className={`col-span-2 ${
                (trade.profitLoss || 0) >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {trade.profitLoss?.toFixed(2)}
            </span>
          </div>
        )}
        {trade.profitLossPercentage !== undefined && (
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-gray-500">P/L %:</span>
            <span
              className={`col-span-2 ${
                (trade.profitLossPercentage || 0) >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {trade.profitLossPercentage?.toFixed(2)}%
            </span>
          </div>
        )}
        {trade.setupImage && (
          <div className="grid grid-cols-3 items-start gap-4">
            <span className="text-sm font-medium text-gray-500">Image:</span>
            <img
              src={trade.setupImage}
              alt="Setup"
              className="col-span-2 w-full h-auto object-cover rounded-md mt-2"
            />
          </div>
        )}
      </div>
    </DialogContent>
  );
};

export default TradeDetails;
