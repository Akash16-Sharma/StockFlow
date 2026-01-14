import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, UserPlus, Shield, ShieldCheck, Trash2, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminUsers() {
  const { user } = useAuth();
  const { isAdmin, isAdminLoading, users, userRoles, assignRole, removeRole, deleteUser, refetch } = useUserRoles();
  const { plan, limits, canAddTeamMember, getRemainingTeamMembers, isLoading: subscriptionLoading } = useSubscription();
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    if (!invitePassword || invitePassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setInviting(true);
    try {
      const response = await supabase.functions.invoke("invite-staff", {
        body: {
          email: inviteEmail.trim(),
          password: invitePassword,
          invitedBy: user?.id,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to create user");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success("Staff member created", {
        description: `${inviteEmail} can now log in with the password you set.`,
      });
      setInviteEmail("");
      setInvitePassword("");
      setIsInviteOpen(false);
      setTimeout(() => refetch(), 1000);
    } catch (error) {
      console.error("Invite error:", error);
      toast.error("Failed to create user", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setInviting(false);
    }
  };

  if (isAdminLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="text-center py-12 space-y-4">
          <Lock className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-semibold">Access Denied</h1>
          <p className="text-muted-foreground">
            You need admin privileges to access this page.
          </p>
        </div>
      </Layout>
    );
  }

  const filteredUsers = users.filter(
    (profile) => profile.id === user?.id || profile.invitedBy === user?.id
  );
  
  // Count staff members (excluding the admin themselves)
  const staffCount = filteredUsers.filter(u => u.id !== user?.id).length;
  const canAddStaff = canAddTeamMember(staffCount + 1); // +1 for the admin
  const remainingSlots = getRemainingTeamMembers(staffCount + 1);
  const isAtLimit = !canAddStaff;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">User Management</h1>
            <p className="text-muted-foreground text-sm">
              Manage your team members ({staffCount + 1}/{limits.maxTeamMembers === Infinity ? '∞' : limits.maxTeamMembers})
            </p>
          </div>
          
          {isAtLimit ? (
            <UpgradePrompt
              feature="Team member limit reached"
              currentPlan={plan}
              requiredPlan="professional"
              currentUsage={staffCount + 1}
              limit={limits.maxTeamMembers}
              variant="inline"
            />
          ) : (
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Staff Member</DialogTitle>
                  <DialogDescription>
                    Create login credentials for a new team member
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="staff@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={invitePassword}
                        onChange={(e) => setInvitePassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share these credentials with your staff member so they can log in.
                  </p>
                  <Button onClick={handleInvite} disabled={inviting} className="w-full">
                    {inviting ? "Creating..." : "Create Staff Account"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {/* Team limit warning */}
        {remainingSlots <= 2 && remainingSlots > 0 && (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm">
              You have {remainingSlots} team slot{remainingSlots !== 1 ? 's' : ''} remaining on your {plan} plan.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 pr-4">
                {filteredUsers.map((profile) => {
                  const roles = userRoles[profile.id] || [];
                  const isCurrentUser = profile.id === user?.id;
                  const isStaff = profile.invitedBy === user?.id;

                  return (
                    <div
                      key={profile.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {(profile.email || "U")[0].toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {profile.fullName || profile.email || "Unknown"}
                          </span>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">You</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {profile.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {roles.includes("admin") ? (
                          <Badge className="bg-purple-500">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        ) : roles.includes("staff") ? (
                          <Badge variant="secondary">
                            <Shield className="h-3 w-3 mr-1" />
                            Staff
                          </Badge>
                        ) : (
                          <Badge variant="outline">No Role</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {isStaff && !roles.includes("admin") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => assignRole.mutate({ userId: profile.id, role: "admin" })}
                          >
                            Make Admin
                          </Button>
                        )}
                        {isStaff && roles.includes("admin") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRole.mutate({ userId: profile.id, role: "admin" })}
                          >
                            Remove Admin
                          </Button>
                        )}
                        
                        {isStaff && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {profile.email} from your team? 
                                  They will no longer have access to your inventory.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser.mutate(profile.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredUsers.length === 1 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No staff members yet</p>
                    <p className="text-sm">Click "Add Staff" to invite team members</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
