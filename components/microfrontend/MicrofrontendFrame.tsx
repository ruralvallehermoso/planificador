'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface MicrofrontendFrameProps {
    src: string;
    title: string;
    className?: string;
    onMessage?: (data: unknown) => void;
    fallbackMessage?: string;
}

export function MicrofrontendFrame({
    src,
    title,
    className = '',
    onMessage,
    fallbackMessage = 'La aplicación no está disponible en este momento.',
}: MicrofrontendFrameProps) {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    const [retryCount, setRetryCount] = useState(0);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Handle postMessage from microfrontend
    useEffect(() => {
        if (!onMessage) return;

        const handleMessage = (event: MessageEvent) => {
            // Validate origin for security
            try {
                const url = new URL(src);
                if (event.origin === url.origin) {
                    onMessage(event.data);
                }
            } catch {
                // Invalid URL, ignore
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [src, onMessage]);

    // Send message to microfrontend
    const sendMessage = useCallback((data: unknown) => {
        if (iframeRef.current?.contentWindow) {
            try {
                const url = new URL(src);
                iframeRef.current.contentWindow.postMessage(data, url.origin);
            } catch {
                console.error('Failed to send message to microfrontend');
            }
        }
    }, [src]);

    const handleLoad = () => {
        setStatus('loaded');
    };

    const handleError = () => {
        setStatus('error');
    };

    const handleRetry = () => {
        setStatus('loading');
        setRetryCount((c) => c + 1);
    };

    // Check if the service is available
    useEffect(() => {
        const checkAvailability = async () => {
            try {
                // Use a timeout to prevent hanging
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const response = await fetch(src, {
                    method: 'HEAD',
                    mode: 'no-cors',
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);

                // no-cors always returns opaque response, so we consider it available
                // The actual error will be caught by iframe onError
            } catch {
                setStatus('error');
            }
        };

        checkAvailability();
    }, [src, retryCount]);

    return (
        <div className={`relative w-full bg-gray-100 overflow-hidden ${className}`} style={{ height: '100vh' }}>
            {/* Loading State */}
            {status === 'loading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="mt-3 text-sm text-gray-600">Cargando {title}...</p>
                </div>
            )}

            {/* Error State */}
            {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                    <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
                    <p className="mt-2 text-sm text-gray-500 text-center max-w-md px-4">
                        {fallbackMessage}
                    </p>
                    <button
                        onClick={handleRetry}
                        className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reintentar
                    </button>
                    <p className="mt-4 text-xs text-gray-400">
                        Asegúrate de que el servicio está corriendo en: {src}
                    </p>
                </div>
            )}

            {/* Iframe */}
            <iframe
                ref={iframeRef}
                key={retryCount}
                src={src}
                title={title}
                className={`w-full border-0 transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'
                    }`}
                style={{ height: '100%', minHeight: '100%' }}
                onLoad={handleLoad}
                onError={handleError}
                allow="clipboard-read; clipboard-write"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            />
        </div>
    );
}
