export default function authHeader() {
  // Token is now stored in HttpOnly cookie and sent automatically with credentials
  // No need to manually add Authorization header
  return {}
}
