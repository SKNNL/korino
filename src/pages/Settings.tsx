import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import MessageTemplates from "@/components/MessageTemplates";
import VerificationRequest from "@/components/VerificationRequest";
import SEO from "@/components/SEO";
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
      <SEO title="Paramètres" description="Gérez vos préférences" />
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold">Paramètres</h1>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="templates">Modèles</TabsTrigger>
            <TabsTrigger value="account">Compte</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
                <CardDescription>Vos informations personnelles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Gérez vos préférences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Notifications par email</label>
                    <p className="text-xs text-muted-foreground">Recevoir des emails</p>
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
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Nouveaux matches</label>
                    <p className="text-xs text-muted-foreground">Notification de match</p>
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
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Messages</label>
                    <p className="text-xs text-muted-foreground">Nouveaux messages</p>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardContent className="pt-6">
                <MessageTemplates />
              </CardContent>
            </Card>
            <div className="mt-6">
              <VerificationRequest />
            </div>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Supprimer le compte</CardTitle>
                <CardDescription>Action irréversible</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer mon compte
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action supprimera toutes vos données définitivement.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
