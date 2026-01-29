import { AlertTriangle, Users, Shield, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskType } from '@/types';

interface Task {
  type: TaskType;
  label: string;
  count: number;
  total: number;
  icon: React.ReactNode;
  severity?: 'warning' | 'error' | 'info';
}

interface TasksPanelProps {
  tasks: Task[];
  activeTask: TaskType | null;
  onSelectTask: (type: TaskType) => void;
}

const taskIcons = {
  conflicts: AlertTriangle,
  speakers: Users,
  pii: Shield,
  acta: FileText,
};

export function TasksPanel({ tasks, activeTask, onSelectTask }: TasksPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="panel-header">
        <h2 className="panel-title">Tasques pendents</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <div className="space-y-1">
          {tasks.map((task) => {
            const Icon = taskIcons[task.type];
            const isComplete = task.count === 0;
            const isActive = activeTask === task.type;
            const progress = task.total > 0 ? ((task.total - task.count) / task.total) * 100 : 100;

            return (
              <button
                key={task.type}
                onClick={() => onSelectTask(task.type)}
                className={cn(
                  "task-item w-full text-left group",
                  isActive && "active",
                  isComplete && "opacity-60"
                )}
                disabled={isComplete}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-md shrink-0",
                  isComplete ? "bg-status-ok-subtle text-status-ok" :
                  task.severity === 'error' ? "bg-status-error-subtle text-status-error" :
                  task.severity === 'warning' ? "bg-status-warning-subtle text-status-warning" :
                  "bg-muted text-muted-foreground"
                )}>
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "text-sm font-medium truncate",
                      isComplete ? "text-muted-foreground" : "text-foreground"
                    )}>
                      {task.label}
                    </span>
                    {!isComplete && (
                      <span className={cn(
                        "task-count",
                        task.severity === 'error' && "error",
                        task.severity === 'warning' && "warning"
                      )}>
                        {task.count}
                      </span>
                    )}
                  </div>
                  
                  {/* Barra de progrés subtil */}
                  <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        isComplete ? "bg-status-ok" : "bg-primary"
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resum ràpid */}
      <div className="p-3 border-t border-panel-border bg-panel-header">
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Progrés total</span>
            <span className="font-medium text-foreground">
              {Math.round(
                tasks.reduce((acc, t) => acc + (t.total > 0 ? ((t.total - t.count) / t.total) : 1), 0) / tasks.length * 100
              )}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
