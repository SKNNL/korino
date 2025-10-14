import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bell, Mail, Shield, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    matches: true,
    messages: true,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.auth.signOut();
      
      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Compte
            </h2>
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des emails de notification
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Nouveaux matchs</Label>
                  <p className="text-sm text-muted-foreground">
                    Être notifié des nouveaux matchs
                  </p>
                </div>
                <Switch
                  checked={notifications.matches}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, matches: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Nouveaux messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Être notifié des nouveaux messages
                  </p>
                </div>
                <Switch
                  checked={notifications.messages}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, messages: checked })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Confidentialité
            </h2>
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => navigate("/comment-ca-marche")}
                className="w-full justify-start"
              >
                Politique de confidentialité
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/comment-ca-marche")}
                className="w-full justify-start"
              >
                Conditions d'utilisation
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Zone de danger
            </h2>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Supprimer mon compte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous vraiment sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Toutes vos données, objets et
                    matchs seront définitivement supprimés.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer définitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
