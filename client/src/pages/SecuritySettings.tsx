import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { Shield, Lock, Smartphone, Key } from "lucide-react";

export default function SecuritySettings() {
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [passwordExpiry, setPasswordExpiry] = useState(90);
  const [ipWhitelist, setIpWhitelist] = useState(["192.168.1.0/24", "203.0.113.0/24"]);
  const [newIp, setNewIp] = useState("");

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Authentication & Security
        </h1>
        <p className="text-muted-foreground mt-2">Configure security policies and access control</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Multi-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Enable MFA</span>
              <Toggle pressed={mfaEnabled} onPressedChange={setMfaEnabled} data-testid="toggle-mfa" />
            </div>
            {mfaEnabled && (
              <div className="space-y-2 pt-2 border-t">
                <label className="text-sm">Available MFA Methods:</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked id="email" />
                    <label htmlFor="email" className="text-sm cursor-pointer">Email</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked id="sms" />
                    <label htmlFor="sms" className="text-sm cursor-pointer">SMS</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked id="app" />
                    <label htmlFor="app" className="text-sm cursor-pointer">Authenticator App</label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-4 w-4" />
              Password Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Password Expiry (days)</label>
              <Input type="number" value={passwordExpiry} onChange={(e) => setPasswordExpiry(parseInt(e.target.value))} className="mt-1" data-testid="input-password-expiry" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Minimum Length:</span>
                <Badge>8 characters</Badge>
              </div>
              <div className="flex justify-between">
                <span>Complexity:</span>
                <Badge>Required</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">Session Timeout (minutes)</label>
            <Input type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(parseInt(e.target.value))} className="mt-1" data-testid="input-session-timeout" />
            <p className="text-xs text-muted-foreground mt-1">User will be logged out after inactivity</p>
          </div>
          <div>
            <label className="text-sm font-medium">Maximum Concurrent Sessions</label>
            <Input type="number" defaultValue={3} className="mt-1" data-testid="input-max-sessions" />
          </div>
          <div>
            <label className="text-sm font-medium">Login Attempt Limit</label>
            <Input type="number" defaultValue={5} className="mt-1" data-testid="input-login-limit" />
            <p className="text-xs text-muted-foreground mt-1">Account will be locked after failed attempts</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>IP Whitelisting / Access Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="Enter IP or CIDR (e.g., 192.168.1.0/24)" value={newIp} onChange={(e) => setNewIp(e.target.value)} data-testid="input-ip-whitelist" />
            <Button onClick={() => {
              if (newIp) {
                setIpWhitelist([...ipWhitelist, newIp]);
                setNewIp("");
              }
            }} data-testid="button-add-ip">Add</Button>
          </div>
          <div className="space-y-2">
            {ipWhitelist.map((ip, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded" data-testid={`ip-item-${idx}`}>
                <span className="text-sm">{ip}</span>
                <Button size="sm" variant="ghost" onClick={() => setIpWhitelist(ipWhitelist.filter((_, i) => i !== idx))} data-testid={`button-remove-ip-${idx}`}>Remove</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" data-testid="button-save-security">Save Security Settings</Button>
    </div>
  );
}
