"use client";

import { LoginForm } from "./login-form";

export default function Login() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-100 dark:bg-black">
            <section className="my-4 flex flex-col items-center justify-center p-8 w-full max-w-md border text-center shadow-sm bg-white">
                <div className="w-full">
                    <p className="pb-0 font-semibold text-primary my-4 text-3xl">Creativeans Marketplace</p>
                    <p className="mb-8 text-sm text-gray-500">Enter your credentials to securely access your account and explore the comprehensive tools and resources.</p>
                    <LoginForm />
                </div>
            </section>
        </div>
    );
}