import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { messageTemplateSchema } from "@/lib/validations";

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
}

interface MessageTemplatesProps {
  onSelectTemplate?: (content: string) => void;
}

const MessageTemplates = ({ onSelectTemplate }: MessageTemplatesProps) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("message_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTemplates(data);
    }
  };

  const handleCreate = async () => {
    // Validate with schema
    const validation = messageTemplateSchema.safeParse({
      title: newTitle.trim(),
      content: newContent.trim(),
    });

    if (!validation.success) {
      toast({
        title: "Erreur de validation",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("message_templates").insert({
      user_id: user.id,
      title: validation.data.title,
      content: validation.data.content,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le modèle",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Modèle créé",
      description: "Votre modèle de message a été créé",
    });

    setNewTitle("");
    setNewContent("");
    setDialogOpen(false);
    loadTemplates();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("message_templates")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le modèle",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Modèle supprimé",
      description: "Le modèle a été supprimé",
    });

    loadTemplates();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Modèles de messages</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau modèle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un modèle de message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Message de bienvenue"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contenu</label>
                <Textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Votre message..."
                  rows={4}
                  maxLength={500}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Créer le modèle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun modèle de message</p>
            <p className="text-sm">Créez des modèles pour répondre plus rapidement</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm">{template.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {template.content}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {onSelectTemplate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectTemplate(template.content)}
                      >
                        Utiliser
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageTemplates;
