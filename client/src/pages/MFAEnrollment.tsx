import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Mail, Key, CheckCircle } from "lucide-react";

export default function MFAEnrollment() {
  const [enrolled] = useState({
    email: true
    authenticator: false
    sms: false
    hardware: false
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Key className="h-8 w-8" />
          Multi-Factor Authentication Enrollment
        </h1>
        <p className="text-muted-foreground mt-2">Set up additional security methods for your account</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="hover-elevate" data-testid="card-mfa-email">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </CardTitle>
              {enrolled.email && <CheckCircle className="h-5 w-5 text-green-600" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Receive authentication codes via email</p>
            <Button variant={enrolled.email ? "outline" : "default"} className="w-full" data-testid="button-email-setup">
              {enrolled.email ? "Configured" : "Set Up"}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-mfa-authenticator">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Authenticator App
              </CardTitle>
              {enrolled.authenticator && <CheckCircle className="h-5 w-5 text-green-600" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Use an authenticator app for 2FA codes</p>
            <Button variant={enrolled.authenticator ? "outline" : "default"} className="w-full" data-testid="button-auth-setup">
              {enrolled.authenticator ? "Configured" : "Set Up"}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-mfa-sms">
          <CardHeader>
            <CardTitle className="text-base">SMS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Receive codes via text message</p>
            <Button variant="default" className="w-full" data-testid="button-sms-setup">Set Up</Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-mfa-hardware">
          <CardHeader>
            <CardTitle className="text-base">Hardware Token</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Use security keys or hardware tokens</p>
            <Button variant="default" className="w-full" data-testid="button-hardware-setup">Set Up</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Backup Codes</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Save backup codes to access your account if you lose access to your authentication method</p>
          <Button variant="secondary" data-testid="button-backup-codes">Generate Backup Codes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
