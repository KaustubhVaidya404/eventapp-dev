import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import { prisma } from '@/utils/db';

const supabaseProjectURL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseProjectURL, supabaseAnonKey)

interface IUser {
  name: string;
  email: string;
  id: Number;
}

//this is not getting called here now, instead this same function gets called in /api/user after uploading csv users
export async function GET(req: Request) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    users.map(async (u: IUser) => {
      const token = jwt.sign({ code: u.id + "-" + u.email }, `${process.env.JWT_SECRET}`, { expiresIn: '60d' });

      const qrCodeData = await QRCode.toDataURL(token);
      const qrCodeBlob = new Blob([Buffer.from(qrCodeData.split(',')[1], 'base64')], { type: 'image/png' });

      const { data: qrData, error: qrError } = await supabase.storage
        .from('QRCodes')
        .upload(`public/qr-${u.email.split('@')[0]}.png`, qrCodeBlob, {
          cacheControl: '3600',
          upsert: false,
        });

      if (qrError) {
        console.error('Error uploading QR code:', qrError.message);
        return NextResponse.json({ error: 'Failed to upload QR code' }, { status: 500 });
      }

      // const qrCodeImageUrl = supabase.storage.from('QRCodes').getPublicUrl(qrData.path).data.publicUrl;

      // yaha pe jo bhi action lena hoga generate karane ke baad...
      // like adding the link in new column or something
      // const user = await prisma.user.update({
      //   where: { email },
      //   data: {  },
      // });
    })


    return NextResponse.json({ success: true, message: "QR code generated successfully" });
  } catch (error) {
    console.error('Error in PUT request:', error);
    return NextResponse.json({ success: false, error: 'QR code generation Failed' }, { status: 500 });
  }
}

interface JwtPayload {
  code: string;
}

export async function POST(req: Request) {
  const { qrCodeData, subEventId } = await req.json();
  try {
    const decode = jwt.verify(
      qrCodeData,
      `${process.env.JWT_SECRET}`
    ) as JwtPayload;
    const code = decode.code;
    const id = Number(code.split("-")[0]);
    const email = code.split("-")[1];
    console.log(code);

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userEvent = await prisma.userEvent.findUnique({
      where: { userId_subEventId: { userId: id, subEventId } },
    });

    if (!userEvent) {
      return NextResponse.json({ error: "User not allowed" }, { status: 404 });
    }

    const serializedUser = { ...user, phone: user.phone.toString() };
    const userData = {
      user: serializedUser,
      userEvent,
    };

    return NextResponse.json({ success: true, userData });
  } catch (error) {
    console.error("Error during QR code validation:", error);
    return NextResponse.json(
      { success: false, error: "QR code validation failed" },
      { status: 500 }
    );
  }
}

// for scanning qr code
export async function PUT(req: Request) {
  const { uid, subEventId } = await req.json();

  try {
    const userEvent = await prisma.userEvent.findUnique({
      where: { userId_subEventId: { userId: uid, subEventId } },
    });

    if (!userEvent) {
      return NextResponse.json(
        { error: "User is not registered for the subevent" },
        { status: 404 }
      );
    }

    const newEvent = await prisma.userEvent.update({
      where: { userId_subEventId: { userId: uid, subEventId } },
      data: { attendedAt: new Date(Date.now()) },
    });

    if (!newEvent) {
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, newEvent });
  } catch (error) {
    console.error("Error Updting:", error);
    return NextResponse.json(
      { success: false, error: "Update failed" },
      { status: 500 }
    );
  }
}
