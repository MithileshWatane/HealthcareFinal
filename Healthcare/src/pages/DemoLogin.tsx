import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Stethoscope, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function DemoLogin() {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const performDemoLogin = async () => {
            try {
                // Demo credentials
                const demoEmail = "hackmatez11@gmail.com";
                const demoPassword = "12345678";

                // Attempt to sign in
                await signIn(demoEmail, demoPassword);

                setStatus('success');

                // Redirect to dashboard after a brief delay
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 1500);
            } catch (error: any) {
                setStatus('error');
                setErrorMessage(error.message || 'Failed to sign in with demo credentials');
            }
        };

        performDemoLogin();
    }, [signIn, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            MedCare AI
                        </span>
                    </div>
                    <p className="text-muted-foreground">Your AI-powered healthcare companion</p>
                </div>

                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-2xl">Demo Access</CardTitle>
                        <CardDescription>
                            {status === 'loading' && 'Signing you in with demo credentials...'}
                            {status === 'success' && 'Successfully signed in! Redirecting...'}
                            {status === 'error' && 'Sign in failed'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        {status === 'loading' && (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                                <Loader2 className="w-16 h-16 text-primary" />
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            >
                                <CheckCircle2 className="w-16 h-16 text-green-500" />
                            </motion.div>
                        )}

                        {status === 'error' && (
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="mb-4"
                                >
                                    <XCircle className="w-16 h-16 text-destructive mx-auto" />
                                </motion.div>
                                <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
                                <button
                                    onClick={() => navigate('/signin')}
                                    className="text-primary hover:underline text-sm font-medium"
                                >
                                    Go to Sign In
                                </button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    This is a demo account for recruiters and portfolio viewers.
                </p>
            </motion.div>
        </div>
    );
}
