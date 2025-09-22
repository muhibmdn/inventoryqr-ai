export function hasPermission(userRole: string, requiredRole: string): boolean {
  // Implement your permission logic here
  // For now, a simple check
  return userRole === requiredRole;
}
