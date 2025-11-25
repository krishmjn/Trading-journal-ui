import Loader from "@/components/ui/Loader";
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import StrategyForm from "@/components/strategies/StrategyForm";
import { MoreHorizontal, PlusCircle, Loader2, FileText } from "lucide-react";
import type { IStrategy } from "@/types";

interface StrategiesTableProps {
  strategies: IStrategy[] | undefined;
  isLoading: boolean;
  handleEditClick: (strategy: IStrategy) => void;
  handleDelete: (id: string) => void;
  isDialogOpen: boolean;
  handleAddClick: () => void;
  handleDialogClose: () => void;
  selectedStrategy: IStrategy | undefined;
  isDeleting: boolean;
  onRowClick: (strategy: IStrategy) => void;
}

const StrategiesTable: React.FC<StrategiesTableProps> = ({
  strategies,
  isLoading,
  handleEditClick,
  handleDelete,
  isDialogOpen,
  handleAddClick,
  handleDialogClose,
  selectedStrategy,
  isDeleting,
  onRowClick,
}) => {
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        {strategies && strategies.length === 0 && (
          <TableCaption>A list of your recent strategies.</TableCaption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {strategies && strategies.length > 0 ? (
            strategies.map((strategy: IStrategy) => (
              <TableRow
                key={strategy._id}
                onClick={() => onRowClick(strategy)}
                className="cursor-pointer"
              >
                <TableCell>
                  {new Date(strategy.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {strategy.content}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEditClick(strategy)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(strategy._id)}
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
              <TableCell colSpan={3} className="h-24 text-center">
                <div className="flex flex-col items-center gap-4 py-8">
                  <FileText className="h-12 w-12 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700">
                    No strategies yet
                  </h3>
                  <p className="text-gray-500">
                    You haven't added any strategies yet. Get started by adding
                    one.
                  </p>
                  <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                    <DialogTrigger asChild>
                      <Button onClick={handleAddClick}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Strategy
                      </Button>
                    </DialogTrigger>
                    <StrategyForm
                      strategy={selectedStrategy}
                      onClose={handleDialogClose}
                    />
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StrategiesTable;
