import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    theme: 'zinc-green',
  })
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { theme } = body

    // Theme feature not implemented yet
    return NextResponse.json({
      theme: 'zinc-green',
    })
  } catch (error) {
    console.error('Error updating theme settings:', error)
    return NextResponse.json(
      { error: 'Failed to update theme settings' },
      { status: 500 }
    )
  }
}
