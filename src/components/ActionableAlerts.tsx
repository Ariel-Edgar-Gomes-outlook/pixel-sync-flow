import { Alert as AlertType } from '@/types/workflows';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActionableAlertsProps {
  alerts: AlertType[];
}

export function ActionableAlerts({ alerts }: ActionableAlertsProps) {
  const navigate = useNavigate();

  if (alerts.length === 0) {
    return null;
  }

  const urgentAlerts = alerts.filter(a => a.priority === 'urgent');
  const attentionAlerts = alerts.filter(a => a.priority === 'attention');
  const infoAlerts = alerts.filter(a => a.priority === 'info');

  const getPriorityIcon = (priority: AlertType['priority']) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4" />;
      case 'attention':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityVariant = (priority: AlertType['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'attention':
        return 'warning';
      case 'info':
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Ações Requeridas
          <Badge variant="secondary">{alerts.length}</Badge>
        </CardTitle>
        <CardDescription>
          Itens que precisam da sua atenção
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {urgentAlerts.length > 0 && (
          <div className="space-y-2">
            {urgentAlerts.map((alert) => (
              <Alert key={alert.id} variant="destructive">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2 flex-1">
                    {getPriorityIcon(alert.priority)}
                    <div className="flex-1">
                      <div className="font-medium">{alert.title}</div>
                      <AlertDescription className="text-sm mt-1">
                        {alert.description}
                        {alert.count && alert.count > 1 && (
                          <Badge variant="secondary" className="ml-2">
                            {alert.count}
                          </Badge>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                  {alert.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(alert.action!.path)}
                    >
                      {alert.action.label}
                    </Button>
                  )}
                </div>
              </Alert>
            ))}
          </div>
        )}

        {attentionAlerts.length > 0 && (
          <div className="space-y-2">
            {attentionAlerts.map((alert) => (
              <Alert key={alert.id} className="border-orange-500/50 bg-orange-500/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2 flex-1">
                    {getPriorityIcon(alert.priority)}
                    <div className="flex-1">
                      <div className="font-medium">{alert.title}</div>
                      <AlertDescription className="text-sm mt-1">
                        {alert.description}
                        {alert.count && alert.count > 1 && (
                          <Badge variant="secondary" className="ml-2">
                            {alert.count}
                          </Badge>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                  {alert.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(alert.action!.path)}
                    >
                      {alert.action.label}
                    </Button>
                  )}
                </div>
              </Alert>
            ))}
          </div>
        )}

        {infoAlerts.length > 0 && (
          <div className="space-y-2">
            {infoAlerts.map((alert) => (
              <Alert key={alert.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2 flex-1">
                    {getPriorityIcon(alert.priority)}
                    <div className="flex-1">
                      <div className="font-medium">{alert.title}</div>
                      <AlertDescription className="text-sm mt-1">
                        {alert.description}
                        {alert.count && alert.count > 1 && (
                          <Badge variant="secondary" className="ml-2">
                            {alert.count}
                          </Badge>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                  {alert.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(alert.action!.path)}
                    >
                      {alert.action.label}
                    </Button>
                  )}
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
