import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Scale,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTrades, deleteTrade } from "@/api/trades";
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
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TradeForm from "@/components/trades/TradeForm";
import { toast } from "sonner";
import { type ITrade } from "@/types";

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<ITrade | undefined>(
    undefined
  );

  const { data: trades, isLoading } = useQuery({
    queryKey: ["trades"],
    queryFn: getTrades,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTrade,
    onSuccess: () => {
      toast.success("Trade deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
    onError: () => {
      toast.error("Failed to delete trade");
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleAddClick = () => {
    setSelectedTrade(undefined);
    setIsDialogOpen(true);
  };

  const handleEditClick = (trade: ITrade) => {
    setSelectedTrade(trade);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedTrade(undefined);
  };

  const totalTrades = trades?.length || 0;
  const openTrades = trades?.filter((t) => t.status === "open").length || 0;
  const totalPL = trades?.reduce((acc, t) => acc + (t.profitLoss || 0), 0) || 0;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Trade
            </Button>
          </DialogTrigger>
          <TradeForm trade={selectedTrade} onClose={handleDialogClose} />
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrades}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P/L</CardTitle>
            {totalPL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalPL >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              NPR {totalPL.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Trades</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTrades}</div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <p>Loading trades...</p>
      ) : (
        <div className="rounded-md border">
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
                  <TableRow key={trade._id}>
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
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditClick(trade)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(trade._id)}
                            className="text-red-500"
                          >
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
                    <div className="flex flex-col items-center gap-4">
                      <h3 className="text-xl font-semibold">
                        No trades yet
                      </h3>
                      <p>
                        You haven't added any trades yet. Get started by
                        adding one.
                      </p>
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                           <Button onClick={handleAddClick}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Trade
                          </Button>
                        </DialogTrigger>
                        <TradeForm trade={selectedTrade} onClose={handleDialogClose} />
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </Layout>
  );
};

export default DashboardPage;
