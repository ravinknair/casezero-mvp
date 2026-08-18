import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface RoleManagerProps {
  roles: Array<{ name: string; users: number; permissions: string }>;
}

export function RoleManager({ roles }: RoleManagerProps) {
  return (
    <Card title="Role manager" subtitle="Review and manage access policies">
      <div className="space-y-3">
        {roles.map((role) => (
          <div key={role.name} className="rounded border border-gray-100 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-800">{role.name}</p>
                <p className="text-sm text-gray-600">{role.permissions}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">{role.users} users</p>
                <Button variant="secondary" className="mt-2 px-3 py-1.5 text-xs">
                  Edit role
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
