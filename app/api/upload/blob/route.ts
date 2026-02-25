import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                // Ensure user is authenticated and is ADMIN
                const session = await auth();
                if (session?.user?.role !== 'ADMIN') {
                    throw new Error('Unauthorized');
                }

                return {
                    allowedContentTypes: [
                        'image/jpeg',
                        'image/png',
                        'image/gif',
                        'image/webp',
                        'image/svg+xml'
                    ],
                    tokenPayload: JSON.stringify({
                        userId: session.user.id
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // Upload completed
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }, // The webhook will retry 5 times waiting for a 200
        );
    }
}
