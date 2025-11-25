import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStrategy, updateStrategy } from "@/api/strategy";
import { toast } from "sonner";
import { type IStrategy } from "@/types";
import axios from "axios";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const strategySchema = z.object({
  date: z.date({
    message: "A date is required.",
  }),
  content: z.string().min(1, "Content is required"),
});

type StrategyFormValues = z.infer<typeof strategySchema>;

interface StrategyFormProps {
  strategy?: IStrategy;
  onClose: () => void;
}

const StrategyForm = ({ strategy, onClose }: StrategyFormProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StrategyFormValues>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      date: strategy ? new Date(strategy.date) : new Date(),
      content: strategy ? strategy.content : "",
    },
  });

  useEffect(() => {
    if (strategy) {
      reset({
        date: new Date(strategy.date),
        content: strategy.content,
      });
    } else {
      reset({
        date: new Date(),
        content: "",
      });
    }
  }, [strategy, reset]);

  const handleError = (error: unknown, defaultMessage: string) => {
    let errorMessage = defaultMessage;
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data;
      if (apiError.message) {
        errorMessage = apiError.errors
          ? `${apiError.message}: ${Object.values(apiError.errors)
              .map((e: any) => e.message)
              .join(", ")}`
          : apiError.message;
      }
    }
    toast.error(errorMessage);
  };

  const createMutation = useMutation({
    mutationFn: createStrategy,
    onSuccess: () => {
      toast.success("Strategy created successfully");
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
      onClose();
    },
    onError: (error) => {
      handleError(error, "Failed to create strategy.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { date: string; content: string };
    }) => updateStrategy(id, data),
    onSuccess: () => {
      toast.success("Strategy updated successfully");
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
      onClose();
    },
    onError: (error) => {
      handleError(error, "Failed to update strategy.");
    },
  });

  const onSubmit = (data: StrategyFormValues) => {
    // Convert date to ISO string for the API
    const dataToSend = {
      ...data,
      date: data.date.toISOString(),
    };
    if (strategy) {
      updateMutation.mutate({ id: strategy._id, data: dataToSend });
    } else {
      createMutation.mutate(dataToSend);
    }
  };

  const isFormLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{strategy ? "Edit Strategy" : "Add New Strategy"}</DialogTitle>
        <DialogDescription>
          Fill in the details of your strategy.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.date && (
            <p className="text-red-500 text-sm">{errors.date.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea id="content" {...register("content")} rows={10} />
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content.message}</p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isFormLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isFormLoading}>
            {isFormLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {strategy
              ? isFormLoading
                ? "Updating..."
                : "Update"
              : isFormLoading
              ? "Creating..."
              : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default StrategyForm;
