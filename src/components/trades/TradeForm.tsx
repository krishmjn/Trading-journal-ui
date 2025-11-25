import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTrade, updateTrade } from "@/api/trades";
import { toast } from "sonner";
import { type ITrade } from "@/types";
import axios from "axios";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Define a base schema without the setupImage for reuse
const baseTradeSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  reason: z.string().min(1, "Reason is required"),
  status: z.enum(["open", "closed"]),
  entryPrice: z.number().min(0),
  quantity: z.number().int().min(1),
  profitLoss: z.number().optional(),
  profitLossPercentage: z.number().optional(),
});

// Define the validation for the image file
const imageSchema = z
  .instanceof(FileList)
  .refine((files) => files?.length === 1, "Image is required.")
  .refine(
    (files) => files?.[0]?.size <= 5000000, // 5MB
    `Max file size is 5MB.`
  )
  .refine(
    (files) =>
      ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
        files?.[0]?.type
      ),
    "Only .jpg, .jpeg, .png and .webp formats are supported."
  );

interface TradeFormProps {
  trade?: ITrade;
  onClose: () => void;
}

const TradeForm = ({ trade, onClose }: TradeFormProps) => {
  const queryClient = useQueryClient();

  // Conditionally create the schema based on whether it's a create or update operation
  const tradeSchema = baseTradeSchema.extend({
    setupImage: trade ? z.instanceof(FileList).optional() : imageSchema,
  });

  type TradeFormValues = z.infer<typeof tradeSchema>;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      date: trade ? new Date(trade.date) : new Date(),
      reason: trade ? trade.reason : "",
      status: trade ? trade.status : "open",
      entryPrice: trade ? trade.entryPrice : 0,
      quantity: trade ? trade.quantity : 1,
      profitLoss: trade ? trade.profitLoss : undefined,
      profitLossPercentage: trade ? trade.profitLossPercentage : undefined,
    },
  });

  useEffect(() => {
    if (trade) {
      reset({
        date: new Date(trade.date),
        reason: trade.reason,
        status: trade.status,
        entryPrice: trade.entryPrice,
        quantity: trade.quantity,
        profitLoss: trade.profitLoss,
        profitLossPercentage: trade.profitLossPercentage,
      });
    } else {
      reset({
        date: new Date(),
        reason: "",
        status: "open",
        entryPrice: 0,
        quantity: 1,
        profitLoss: undefined,
        profitLossPercentage: undefined,
      });
    }
  }, [trade, reset]);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const setupImage = watch("setupImage");

  useEffect(() => {
    if (setupImage && setupImage.length > 0) {
      const file = setupImage[0];
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } else if (trade?.setupImage) {
      setImagePreview(trade.setupImage);
    } else {
      setImagePreview(null);
    }
  }, [setupImage, trade, reset]);

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
    mutationFn: createTrade,
    onSuccess: () => {
      toast.success("Trade created successfully");
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      onClose();
    },
    onError: (error) => {
      handleError(error, "Failed to create trade.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateTrade(id, formData),
    onSuccess: () => {
      toast.success("Trade updated successfully");
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      onClose();
    },
    onError: (error) => {
      handleError(error, "Failed to update trade.");
    },
  });

  const onSubmit = (data: TradeFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "setupImage") {
        if (value instanceof FileList && value.length > 0) {
          formData.append(key, value[0]);
        }
      } else if (key === "date") {
        formData.append(key, (value as Date).toISOString()); // Convert Date object to ISO string
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (trade) {
      updateMutation.mutate({ id: trade._id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isFormLoading =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{trade ? "Edit Trade" : "Add New Trade"}</DialogTitle>
        <DialogDescription>
          Fill in the details of your trade.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Controller
              name="date"
              control={control}
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
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-red-500 text-sm">{errors.status.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason for trade</Label>
          <Textarea id="reason" {...register("reason")} />
          {errors.reason && (
            <p className="text-red-500 text-sm">{errors.reason.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="entryPrice">Entry Price</Label>
            <Input
              id="entryPrice"
              type="number"
              step="0.01"
              {...register("entryPrice", { valueAsNumber: true })}
            />
            {errors.entryPrice && (
              <p className="text-red-500 text-sm">
                {errors.entryPrice.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              {...register("quantity", { valueAsNumber: true })}
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm">{errors.quantity.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="profitLoss">Profit/Loss</Label>
            <Input
              id="profitLoss"
              type="number"
              step="0.01"
              {...register("profitLoss", { valueAsNumber: true })}
            />
            {errors.profitLoss && (
              <p className="text-red-500 text-sm">
                {errors.profitLoss.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="profitLossPercentage">Profit/Loss %</Label>
            <Input
              id="profitLossPercentage"
              type="number"
              step="0.01"
              {...register("profitLossPercentage", { valueAsNumber: true })}
            />
            {errors.profitLossPercentage && (
              <p className="text-red-500 text-sm">
                {errors.profitLossPercentage.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="setupImage">Setup Image</Label>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Setup Preview"
              className="w-full h-40 object-cover rounded-md mt-2"
            />
          )}
          <Input id="setupImage" type="file" {...register("setupImage")} />
          {errors.setupImage && (
            <p className="text-red-500 text-sm">
              {(errors.setupImage as any).message}
            </p>
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
            {trade
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

export default TradeForm;
