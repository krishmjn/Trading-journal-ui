import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Scale,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTrades, deleteTrade } from "@/api/trades";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TradeForm from "@/components/trades/TradeForm";
import TradesTable from "@/components/trades/TradesTable";
import { toast } from "sonner";
import { type ITrade } from "@/types";

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false); // For TradeForm (Add/Edit)
  const [selectedTrade, setSelectedTrade] = useState<ITrade | undefined>(
    undefined
  ); // For TradeForm (Edit)

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false); // For TradeDetails
  const [selectedTradeDetails, setSelectedTradeDetails] = useState<ITrade | undefined>(
    undefined
  ); // For TradeDetails

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

  // Handlers for TradeDetails Dialog
  const handleRowClick = (trade: ITrade) => {
    setSelectedTradeDetails(trade);
    setIsDetailsDialogOpen(true);
  };

  const handleDetailsDialogClose = () => {
    setIsDetailsDialogOpen(false);
    setSelectedTradeDetails(undefined);
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

      <TradesTable
        trades={trades}
        isLoading={isLoading}
        handleEditClick={handleEditClick}
        handleDelete={handleDelete}
        isDialogOpen={isDialogOpen}
        handleAddClick={handleAddClick}
        handleDialogClose={handleDialogClose}
        selectedTrade={selectedTrade}
        isDeleting={deleteMutation.isPending}
        onRowClick={handleRowClick}
        onDetailsDialogClose={handleDetailsDialogClose}
        isDetailsDialogOpen={isDetailsDialogOpen}
        selectedTradeDetails={selectedTradeDetails}
      />
    </Layout>
  );
};

export default DashboardPage;
