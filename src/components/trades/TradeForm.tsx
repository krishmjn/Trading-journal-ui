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

// Define a base schema without the setupImage for reuse
const baseTradeSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  reason: z.string().min(1, "Reason is required"),
  status: z.enum(["open", "closed"]),
  entryPrice: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(1),
  profitLoss: z.coerce.number().optional(),
  profitLossPercentage: z.coerce.number().optional(),
});

// Define the validation for the image file
const imageSchema = z
  .any()
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
    setupImage: trade ? z.any().optional() : imageSchema,
  });

  type TradeFormValues = z.infer<typeof tradeSchema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      date: trade ? new Date(trade.date).toISOString().substring(0, 10) : "",
      reason: trade?.reason || "",
      status: trade?.status || "open",
      entryPrice: trade?.entryPrice || 0,
      quantity: trade?.quantity || 1,
      profitLoss: trade?.profitLoss || undefined,
      profitLossPercentage: trade?.profitLossPercentage || undefined,
    },
  });

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
        if (value && value[0]) {
          formData.append(key, value[0]);
        }
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

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{trade ? "Edit Trade" : "Add New Trade"}</DialogTitle>
        <DialogDescription>
          Fill in the details of your trade.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="entryPrice">Entry Price</Label>
            <Input
              id="entryPrice"
              type="number"
              step="0.01"
              {...register("entryPrice")}
            />
            {errors.entryPrice && (
              <p className="text-red-500 text-sm">
                {errors.entryPrice.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" {...register("quantity")} />
            {errors.quantity && (
              <p className="text-red-500 text-sm">{errors.quantity.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="profitLoss">Profit/Loss</Label>
            <Input
              id="profitLoss"
              type="number"
              step="0.01"
              {...register("profitLoss")}
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
              {...register("profitLossPercentage")}
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
          <Input id="setupImage" type="file" {...register("setupImage")} />
          {errors.setupImage && (
            <p className="text-red-500 text-sm">
              {(errors.setupImage as any).message}
            </p>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default TradeForm;
