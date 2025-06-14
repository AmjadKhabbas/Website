import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to main login page
    setLocation("/login");
  }, [setLocation]);

  return null;
}