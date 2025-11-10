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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        
        // Load notification preferences
        const { data: profile } = await supabase
          .from("profiles")
          .select("email_notifications, match_notifications, message_notifications")
          .eq("id", user.id)
          .maybeSingle();
        
        if (profile) {
          setNotifications({
            email: profile.email_notifications ?? true,
            matches: profile.match_notifications ?? true,
            messages: profile.message_notifications ?? true,
          });
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use the comprehensive deletion function
      const { error } = await supabase.rpc("delete_user_account", {
        user_id_to_delete: user.id,
      });

      if (error) throw error;

      await supabase.auth.signOut();
      
      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès.",
      });
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationChange = async (
    field: "email_notifications" | "match_notifications" | "message_notifications",
    value: boolean
  ) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ [field]: value })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Préférences mises à jour",
        description: "Vos préférences de notification ont été enregistrées",
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les préférences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, email: checked });
                    handleNotificationChange("email_notifications", checked);
                  }}
                  disabled={loading}
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
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, matches: checked });
                    handleNotificationChange("match_notifications", checked);
                  }}
                  disabled={loading}
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
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, messages: checked });
                    handleNotificationChange("message_notifications", checked);
                  }}
                  disabled={loading}
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
