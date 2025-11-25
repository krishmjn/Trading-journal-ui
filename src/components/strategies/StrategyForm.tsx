import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2 } from "lucide-react";

const strategySchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
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
    formState: { errors, isSubmitting },
  } = useForm<StrategyFormValues>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      date: strategy ? new Date(strategy.date).toISOString().substring(0, 10) : "",
      content: strategy ? strategy.content : "",
    },
  });

  useEffect(() => {
    if (strategy) {
      reset({
        date: new Date(strategy.date).toISOString().substring(0, 10),
        content: strategy.content,
      });
    } else {
      reset({
        date: "",
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
    mutationFn: ({ id, data }: { id: string; data: StrategyFormValues }) =>
      updateStrategy(id, data),
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
    if (strategy) {
      updateMutation.mutate({ id: strategy._id, data });
    } else {
      createMutation.mutate(data);
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
          <Input id="date" type="date" {...register("date")} />
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
