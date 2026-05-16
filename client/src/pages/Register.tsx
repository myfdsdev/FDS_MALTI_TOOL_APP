import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthLayout, Divider } from "@/pages/Login";

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <Card>
          <CardHeader className="space-y-1.5">
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Start using your tools in one workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <RegisterForm />
            <Divider>or</Divider>
            <GoogleButton onSuccess={() => navigate("/dashboard", { replace: true })} />
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already a member?{" "}
          <Link to="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
