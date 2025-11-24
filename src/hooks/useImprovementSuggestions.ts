import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ImprovementSuggestion {
  id: string;
  user_id: string;
  system_area: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSuggestionData {
  system_area: string;
  title: string;
  description: string;
  priority?: string;
}

export function useImprovementSuggestions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["improvement-suggestions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("improvement_suggestions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ImprovementSuggestion[];
    },
    enabled: !!user?.id,
  });

  const createSuggestion = useMutation({
    mutationFn: async (data: CreateSuggestionData) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      const { data: suggestion, error } = await supabase
        .from("improvement_suggestions")
        .insert({
          user_id: user.id,
          system_area: data.system_area,
          title: data.title,
          description: data.description,
          priority: data.priority || "medium",
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return suggestion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["improvement-suggestions"] });
      toast.success("Sugestão enviada com sucesso!", {
        description: "Obrigado pelo seu feedback. Analisaremos sua sugestão em breve.",
      });
    },
    onError: (error: any) => {
      console.error("Erro ao enviar sugestão:", error);
      toast.error("Erro ao enviar sugestão", {
        description: "Tente novamente mais tarde.",
      });
    },
  });

  return {
    suggestions: suggestions || [],
    isLoading,
    createSuggestion: createSuggestion.mutate,
    isCreating: createSuggestion.isPending,
  };
}
