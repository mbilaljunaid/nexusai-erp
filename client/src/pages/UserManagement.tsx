import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Lock, Unlock, Eye } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([
    { id: "u1", name: "Alice Admin", email: "alice@example.com", role: "admin", status: "active", dept: "IT", manager: "N/A", employeeId: "EMP001", mfa: true },
    { id: "u2", name: "Bob Manager", email: "bob@example.com", role: "editor", status: "active", dept: "Sales", manager: "Alice", employeeId: "EMP002", mfa: false },
    { id: "u3", name: "Carol User", email: "carol@example.com", role: "viewer", status: "inactive", dept: "HR", manager: "Alice", employeeId: "EMP003", mfa: true },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "viewer", dept: "", manager: "" });

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      setUsers([...users, { id: `u${Date.now()}`, ...newUser, status: "active", employeeId: `EMP${users.length + 4}`, mfa: false }]);
      setNewUser({ name: "", email: "", role: "viewer", dept: "", manager: "" });
      setShowForm(false);
    }
  };

  const handleDeactivate = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u));
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Master</h1>
          <p className="text-muted-foreground mt-2">Manage employees, system identities, and access control</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2" data-testid="button-add-user">
          <Plus className="h-4 w-4" />
          New User
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 bg-muted/50">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input placeholder="Full Name" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} data-testid="input-user-name" />
            <Input placeholder="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} data-testid="input-user-email" />
            <select className="border rounded px-3 py-2" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} data-testid="select-user-role">
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <Input placeholder="Department" value={newUser.dept} onChange={(e) => setNewUser({...newUser, dept: e.target.value})} data-testid="input-user-dept" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddUser} className="flex-1" data-testid="button-save-user">Save</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1" data-testid="button-cancel-user">Cancel</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4"><CardContent className="pt-0"><p className="text-sm text-muted-foreground">Total Users</p><p className="text-2xl font-bold">{users.length}</p></CardContent></Card>
        <Card className="p-4"><CardContent className="pt-0"><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{users.filter(u => u.status === "active").length}</p></CardContent></Card>
        <Card className="p-4"><CardContent className="pt-0"><p className="text-sm text-muted-foreground">MFA Enabled</p><p className="text-2xl font-bold text-blue-600">{users.filter(u => u.mfa).length}</p></CardContent></Card>
        <Card className="p-4"><CardContent className="pt-0"><p className="text-sm text-muted-foreground">Inactive</p><p className="text-2xl font-bold text-orange-600">{users.filter(u => u.status === "inactive").length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users & Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate" data-testid={`user-row-${user.id}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.name}</span>
                    {user.mfa && <Badge className="text-xs">MFA</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {user.email} • {user.employeeId} • {user.dept} (Reports to: {user.manager})
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                  <Badge variant="outline" className="text-xs">{user.role}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => handleDeactivate(user.id)} data-testid={`button-toggle-${user.id}`}>
                    {user.status === "active" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
