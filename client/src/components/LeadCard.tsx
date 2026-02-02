import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MoreHorizontal, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  score: number;
  value: number;
  lastContact?: string;
}

const statusColors: Record<Lead["status"], string> = {
  new: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  contacted: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  qualified: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  proposal: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  won: "bg-green-500/10 text-green-600 dark:text-green-400",
  lost: "bg-red-500/10 text-red-600 dark:text-red-400",
};

interface LeadCardProps {
  lead: Lead;
  onCall?: (lead: Lead) => void;
  onEmail?: (lead: Lead) => void;
}

export function LeadCard({ lead, onCall, onEmail }: LeadCardProps) {
  const initials = lead.name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  return (
    <Card className="hover-elevate" data-testid={`card-lead-${lead.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-sm truncate">{lead.name}</h4>
              <Badge variant="secondary" className={`text-xs ${statusColors[lead.status]}`}>
                {lead.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
            <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-lead-menu-${lead.id}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Lead</DropdownMenuItem>
              <DropdownMenuItem>Add Note</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="font-medium">{lead.score}</span>
              <span className="text-muted-foreground">AI Score</span>
            </div>
          </div>
          <p className="text-sm font-semibold font-mono">${lead.value.toLocaleString()}</p>
        </div>
        
        <div className="mt-3 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onCall?.(lead)}
            data-testid={`button-call-${lead.id}`}
          >
            <Phone className="h-3 w-3 mr-1" />
            Call
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEmail?.(lead)}
            data-testid={`button-email-${lead.id}`}
          >
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
