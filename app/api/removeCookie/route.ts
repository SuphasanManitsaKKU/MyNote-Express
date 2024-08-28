'use server'
import { cookies } from 'next/headers'

export async function GET() {
    cookies().delete('token')
    return new Response(JSON.stringify({ massage: "cookie has deleted" }), { status: 200 });
}
