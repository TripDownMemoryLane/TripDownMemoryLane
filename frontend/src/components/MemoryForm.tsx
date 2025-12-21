import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { MEMORY_CATEGORIES } from "@shared/schema";

const formSchema = z.object({
  title: z.string().min(1, "請輸入標題"),
  description: z.string().min(1, "請輸入描述"),
  people: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
});

export type MemoryFormData = z.infer<typeof formSchema>;

interface MemoryFormProps {
  onSubmit: (data: MemoryFormData) => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<MemoryFormData>;
}

export function MemoryForm({ onSubmit, isSubmitting, defaultValues }: MemoryFormProps) {
  const form = useForm<MemoryFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      people: defaultValues?.people || "",
      date: defaultValues?.date || "",
      location: defaultValues?.location || "",
      category: defaultValues?.category || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xl font-semibold">照片標題</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="例如：2020年春節全家福"
                  className="h-14 text-lg px-6 rounded-xl"
                  data-testid="input-memory-title"
                />
              </FormControl>
              <FormMessage className="text-base" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xl font-semibold">分類（選填）</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger 
                    className="h-14 text-lg px-6 rounded-xl"
                    data-testid="select-memory-category"
                  >
                    <SelectValue placeholder="選擇分類" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MEMORY_CATEGORIES.map((cat) => (
                    <SelectItem 
                      key={cat.value} 
                      value={cat.value}
                      className="text-lg py-3"
                    >
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-base" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xl font-semibold">照片描述</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="描述這張照片的故事，例如：這是在老家過年時拍的，當時全家人一起包餃子..."
                  className="min-h-32 text-lg px-6 py-4 rounded-xl resize-none"
                  data-testid="input-memory-description"
                />
              </FormControl>
              <FormMessage className="text-base" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="people"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xl font-semibold">照片中的人物（選填）</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="例如：爸爸、媽媽、小明"
                  className="h-14 text-lg px-6 rounded-xl"
                  data-testid="input-memory-people"
                />
              </FormControl>
              <FormMessage className="text-base" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-semibold">拍攝日期（選填）</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="例如：2020年1月25日"
                    className="h-14 text-lg px-6 rounded-xl"
                    data-testid="input-memory-date"
                  />
                </FormControl>
                <FormMessage className="text-base" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-semibold">拍攝地點（選填）</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="例如：台北老家"
                    className="h-14 text-lg px-6 rounded-xl"
                    data-testid="input-memory-location"
                  />
                </FormControl>
                <FormMessage className="text-base" />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full h-16 text-xl font-semibold rounded-xl"
          data-testid="button-save-memory"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              儲存中...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              儲存記憶
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
