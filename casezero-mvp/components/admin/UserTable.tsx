import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "invited" | "suspended";
}

interface UserTableProps {
  users: AdminUser[];
}

export function UserTable({ users }: UserTableProps) {
  return (
    <Table headers={["Name", "Email", "Role", "Status"]}>
      {users.map((user) => (
        <tr key={user.id}>
          <td className="px-4 py-3 text-sm font-medium text-gray-800">{user.name}</td>
          <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
          <td className="px-4 py-3 text-sm text-gray-700">{user.role}</td>
          <td className="px-4 py-3 text-sm">
            <Badge tone={user.status === "active" ? "success" : user.status === "invited" ? "info" : "warning"}>
              {user.status}
            </Badge>
          </td>
        </tr>
      ))}
    </Table>
  );
}
