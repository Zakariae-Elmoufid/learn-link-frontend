'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { useInitAuth } from '../hookes'

function AuthInitializer({ children }: { children: React.ReactNode }) {
    // Initialize auth state from token
    useInitAuth();
    return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            <AuthInitializer>
                {children}
            </AuthInitializer>
            <Toaster toastOptions={{ duration: 5000 }}
                     position="top-right"
                    />
        </QueryClientProvider>
    )
}
