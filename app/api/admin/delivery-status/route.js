import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// POST /api/admin/delivery-status
// handles marking delivery DELIVERED/FAILED with delivery proof photo file upload
export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const deliveryId = formData.get('deliveryId');
    const status = formData.get('status'); // DELIVERED | FAILED
    const note = formData.get('note') || '';
    const proofFile = formData.get('proof'); // File

    if (!deliveryId || !status) {
      return NextResponse.json(
        { error: 'deliveryId and status are required' },
        { status: 400 }
      );
    }

    let proofUrl = null;
    if (proofFile && typeof proofFile === 'object' && proofFile.name && proofFile.size > 0) {
      const bytes = await proofFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // ensure uploads directory exists
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      const fileName = `proof-${Date.now()}-${proofFile.name.replace(/\s+/g, '-')}`;
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      proofUrl = `/uploads/${fileName}`;
    }

    const updated = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status,
        note: note ? String(note) : undefined,
        proofUrl: proofUrl || undefined,
      },
    });

    return NextResponse.json({ success: true, delivery: updated });
  } catch (error) {
    console.error('Update delivery status error:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery status' },
      { status: 500 }
    );
  }
}
