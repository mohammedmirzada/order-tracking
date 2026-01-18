import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';
    
    const queryString = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
    }).toString();
    
    const fetchWithRetry = async (retries = 1, delayMs = 300) => {
      try {
        return await fetch(`${API_URL}/orders?${queryString}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
      } catch (err) {
        if (retries <= 0) throw err;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return fetchWithRetry(retries - 1, delayMs * 2);
      }
    };

    const res = await fetchWithRetry(1, 300);

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { message: error.message || "Failed to fetch orders" },
        { status: res.status }
      );
    }

    const data = await res.json();

    const normalized = {
      ...data,
      data: Array.isArray(data?.data)
        ? data.data.map((order: any) => ({
            ...order,
            items: Array.isArray(order?.items) ? order.items : [],
            invoices: Array.isArray(order?.invoices) ? order.invoices : [],
          }))
        : [],
      meta: {
        total: Number(data?.meta?.total ?? 0),
        page: Number(data?.meta?.page ?? 1),
        limit: Number(data?.meta?.limit ?? (Number(limit) || 10)),
        totalPages: Number(data?.meta?.totalPages ?? 0),
      },
    };
    
    // Add cache control headers to prevent stale data
    return NextResponse.json(normalized, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { message: error.message || "Failed to create order" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
