import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStrategies, deleteStrategy } from "@/api/strategy";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { format } from "date-fns";
import StrategyForm from "@/components/strategies/StrategyForm";
import StrategiesTable from "@/components/strategies/StrategiesTable";
import StrategyDetails from "@/components/strategies/StrategyDetails";
import { cn } from "@/lib/utils";
import type { IStrategy } from "@/types";

const StrategyPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<
    IStrategy | undefined
  >(undefined);

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedStrategyDetails, setSelectedStrategyDetails] = useState<
    IStrategy | undefined
  >(undefined);

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [sort, setSort] = useState<string>("desc");

  const { data: strategies, isLoading } = useQuery({
    queryKey: ["strategies", date, sort],
    queryFn: () =>
      getStrategies(date ? format(date, "yyyy-MM-dd") : undefined, sort),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStrategy,
    onSuccess: () => {
      toast.success("Strategy deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
    },
    onError: () => {
      toast.error("Failed to delete strategy");
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleAddClick = () => {
    setSelectedStrategy(undefined);
    setIsDialogOpen(true);
  };

  const handleEditClick = (strategy: IStrategy) => {
    setSelectedStrategy(strategy);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedStrategy(undefined);
  };

  const handleRowClick = (strategy: IStrategy) => {
    setSelectedStrategyDetails(strategy);
    setIsDetailsDialogOpen(true);
  };

  const handleDetailsDialogClose = () => {
    setIsDetailsDialogOpen(false);
    setSelectedStrategyDetails(undefined);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Strategies</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
      <div className="flex items-center space-x-4 mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <StrategiesTable
        strategies={strategies}
        isLoading={isLoading}
        handleEditClick={handleEditClick}
        handleDelete={handleDelete}
        isDialogOpen={isDialogOpen}
        handleAddClick={handleAddClick}
        handleDialogClose={handleDialogClose}
        selectedStrategy={selectedStrategy}
        isDeleting={deleteMutation.isPending}
        onRowClick={handleRowClick}
      />
      {selectedStrategyDetails && (
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={handleDetailsDialogClose}
        >
          <StrategyDetails strategy={selectedStrategyDetails} />
        </Dialog>
      )}
    </Layout>
  );
};

export default StrategyPage;
