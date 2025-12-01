import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, AlertTriangle } from "lucide-react";

export default function PasswordPolicies() {
  const policy = {
    minLength: 8
    maxLength: 128
    uppercase: true
    lowercase: true
    numbers: true
    specialChars: true
    expiryDays: 90
    reuseRestriction: 5
    lockoutAttempts: 5
    lockoutDuration: 30
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Lock className="h-8 w-8" />
          Password Policies
        </h1>
        <p className="text-muted-foreground mt-2">Configure organization-wide password requirements</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card data-testid="card-length-requirements">
          <CardHeader><CardTitle className="text-base">Length Requirements</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Minimum:</span>
              <Badge>{policy.minLength} characters</Badge>
            </div>
            <div className="flex justify-between">
              <span>Maximum:</span>
              <Badge variant="outline">{policy.maxLength} characters</Badge>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-complexity">
          <CardHeader><CardTitle className="text-base">Complexity Requirements</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {policy.uppercase && <div className="flex items-center gap-2">✓ Uppercase letters (A-Z)</div>}
            {policy.lowercase && <div className="flex items-center gap-2">✓ Lowercase letters (a-z)</div>}
            {policy.numbers && <div className="flex items-center gap-2">✓ Numbers (0-9)</div>}
            {policy.specialChars && <div className="flex items-center gap-2">✓ Special characters (!@#$%)</div>}
          </CardContent>
        </Card>

        <Card data-testid="card-expiry">
          <CardHeader><CardTitle className="text-base">Expiry & History</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Expiry:</span>
              <Badge>{policy.expiryDays} days</Badge>
            </div>
            <div className="flex justify-between">
              <span>Cannot reuse:</span>
              <Badge variant="outline">Last {policy.reuseRestriction} passwords</Badge>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-security">
          <CardHeader><CardTitle className="text-base">Account Security</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Failed attempts:</span>
              <Badge>{policy.lockoutAttempts} max</Badge>
            </div>
            <div className="flex justify-between">
              <span>Lockout duration:</span>
              <Badge variant="outline">{policy.lockoutDuration} minutes</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-900/10">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-orange-900 dark:text-orange-200">
            <AlertTriangle className="h-4 w-4" />
            Policy Enforcement
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-orange-800 dark:text-orange-300">
          <p>Password policy changes are applied to all new passwords. Existing passwords remain valid until expiry.</p>
        </CardContent>
      </Card>
    </div>
  );
}
