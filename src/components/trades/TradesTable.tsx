import Loader from "@/components/ui/Loader"; // Import the new Loader component
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { DialogTrigger, Dialog as UIDialog } from "@/components/ui/dialog"; // Renamed Dialog to UIDialog to avoid conflict with local Dialog
import TradeForm from "@/components/trades/TradeForm";
import TradeDetails from "@/components/trades/TradeDetails"; // Import TradeDetails
import { type ITrade } from "@/types";
import { MoreHorizontal, PlusCircle, Loader2, FileText } from "lucide-react";

interface TradesTableProps {
  trades: ITrade[] | undefined;
  isLoading: boolean;
  handleEditClick: (trade: ITrade) => void;
  handleDelete: (id: string) => void;
  isDialogOpen: boolean; // For TradeForm
  handleAddClick: () => void; // For TradeForm
  handleDialogClose: () => void; // For TradeForm
  selectedTrade: ITrade | undefined; // For TradeForm
  isDeleting: boolean;

  // New props for TradeDetails Dialog
  onRowClick: (trade: ITrade) => void;
  onDetailsDialogClose: () => void;
  isDetailsDialogOpen: boolean;
  selectedTradeDetails: ITrade | undefined;
}

const TradesTable: React.FC<TradesTableProps> = ({
  trades,
  isLoading,
  handleEditClick,
  handleDelete,
  isDialogOpen,
  handleAddClick,
  handleDialogClose,
  selectedTrade,
  isDeleting,
  onRowClick,
  onDetailsDialogClose,
  isDetailsDialogOpen,
  selectedTradeDetails,
}) => {
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        {trades && trades.length === 0 && (
          <TableCaption>A list of your recent trades.</TableCaption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Entry Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>P/L</TableHead>
            <TableHead>P/L %</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades && trades.length > 0 ? (
            trades.map((trade: ITrade) => (
              <TableRow
                key={trade._id}
                onClick={() => onRowClick(trade)} // Make row clickable
                className="cursor-pointer" // Add cursor style for clickable rows
              >
                <TableCell>
                  <Popover>
                    <PopoverTrigger>
                      <img
                        src={trade.setupImage}
                        alt="Setup"
                        className="h-10 w-10 object-cover rounded-md"
                      />
                    </PopoverTrigger>
                    <PopoverContent>
                      <img
                        src={trade.setupImage}
                        alt="Setup"
                        className="w-full rounded-md"
                      />
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  {new Date(trade.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{trade.reason}</TableCell>
                <TableCell>{trade.status}</TableCell>
                <TableCell>{trade.entryPrice}</TableCell>
                <TableCell>{trade.quantity}</TableCell>
                <TableCell
                  className={
                    (trade.profitLoss || 0) >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {trade.profitLoss?.toFixed(2) ?? "N/A"}
                </TableCell>
                <TableCell
                  className={
                    (trade.profitLossPercentage || 0) >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {trade.profitLossPercentage?.toFixed(2) ?? "N/A"}%
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {" "}
                  {/* Prevent row click when clicking action buttons */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(trade)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(trade._id)}
                        className="text-red-500"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                <div className="flex flex-col items-center gap-4 py-8">
                  {" "}
                  {/* Added py-8 for more vertical spacing */}
                  <FileText className="h-12 w-12 text-gray-400" />{" "}
                  {/* Added FileText icon */}
                  <h3 className="text-xl font-semibold text-gray-700">
                    No trades yet
                  </h3>
                  <p className="text-gray-500">
                    You haven't added any trades yet. Get started by adding one.
                  </p>
                  <UIDialog
                    open={isDialogOpen}
                    onOpenChange={handleDialogClose}
                  >
                    <DialogTrigger asChild>
                      <Button onClick={handleAddClick}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Trade
                      </Button>
                    </DialogTrigger>
                    <TradeForm
                      trade={selectedTrade}
                      onClose={handleDialogClose}
                    />
                  </UIDialog>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Trade Details Dialog */}
      {selectedTradeDetails && (
        <UIDialog
          open={isDetailsDialogOpen}
          onOpenChange={onDetailsDialogClose}
        >
          <TradeDetails trade={selectedTradeDetails} />
        </UIDialog>
      )}
    </div>
  );
};

export default TradesTable;
