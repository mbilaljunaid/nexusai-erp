import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; import { Button } from "@/components/ui/button"; import { Plus, ArrowLeft } from "lucide-react"; import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";

export default function AdminRolesDetail() { return (<StandardPage title="Role Management"><div className="flex items-center gap-2"><Link to="/admin"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link><div><p className="text-muted-foreground text-sm">Manage roles</p></div></div><Card><CardHeader><CardTitle>Roles</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Coming soon</p></CardContent></Card></StandardPage>); }
