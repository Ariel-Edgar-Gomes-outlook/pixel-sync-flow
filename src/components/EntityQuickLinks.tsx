import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, FileText, CreditCard, FileCheck, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EntityLink {
  type: 'client' | 'job' | 'quote' | 'invoice' | 'payment' | 'contract';
  id: string;
  name: string;
  status?: string;
}

interface EntityQuickLinksProps {
  links: EntityLink[];
  className?: string;
}

const iconMap = {
  client: Users,
  job: Briefcase,
  quote: FileText,
  invoice: CreditCard,
  payment: Receipt,
  contract: FileCheck,
};

const routeMap = {
  client: '/clients',
  job: '/jobs',
  quote: '/quotes',
  invoice: '/invoices',
  payment: '/payments',
  contract: '/contracts',
};

export function EntityQuickLinks({ links, className = "" }: EntityQuickLinksProps) {
  const navigate = useNavigate();

  if (links.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {links.map((link) => {
        const Icon = iconMap[link.type];
        
        return (
          <Badge
            key={`${link.type}-${link.id}`}
            variant="outline"
            className="cursor-pointer hover:bg-accent transition-colors gap-1.5"
            onClick={() => navigate(routeMap[link.type])}
          >
            <Icon className="h-3 w-3" />
            <span className="text-xs">{link.name}</span>
            {link.status && (
              <span className="text-[10px] opacity-70">• {link.status}</span>
            )}
          </Badge>
        );
      })}
    </div>
  );
}
