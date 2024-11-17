import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import createIdCard from "./createCards";

const supabaseProjectURL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseProjectURL, supabaseAnonKey)


export async function GET() {
  try {
    const users = await prisma.user.findMany();
    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: "No User Data Found" },
        { status: 404 }
      );
    }
    // Serialized the BigInt phone to string
    const usersSerialized = users.map((user) => ({
      ...user,
      phone: user.phone.toString(),
    }));
    return NextResponse.json({ success: true, usersSerialized });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

interface IUser {
  name: string;
  email: string;
  id: Number;
}

export async function POST(req: NextRequest) {

  const { receivedData, eventId } = await req.json();
  // console.log(receivedData, eventId)
  try {
    const eventParsedId = parseInt(eventId);
    if (
      !receivedData ||
      !eventId ||
      Number.isNaN(eventParsedId) ||
      receivedData.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "No data received" },
        { status: 400 }
      );
    }
    const result = await prisma.user.createManyAndReturn({
      data: receivedData,
      skipDuplicates: true
    });

    // function to generate QR immidiately after uploading the csv and adding all the users in DB
    result.map(async (u: IUser) => {
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

      const qrCodeImageUrl = supabase.storage.from('QRCodes').getPublicUrl(qrData.path).data.publicUrl;

      // yaha pe jo bhi action lena hoga generate karane ke baad...
      // like adding the link in new column or something
      const user = await prisma.user.update({
        where: { email: u.email },
        data: { imageUrl: qrCodeImageUrl },
      });

      await createIdCard(user)  // from createCards.ts This generates ID card in ./id_cards folder
    })


    const subEvents = await prisma.subEvent.findMany({
      where: { 
        eventId: eventParsedId,
      },
    });



    if (!result || !subEvents) {
      return NextResponse.json(
        { success: false, error: "Something went wrong" },
        { status: 500 }
      );
    }
    let UserEventArray = <any>[]
    result.map((user) => {
      const id = user.id
      subEvents.map((event) => {
        UserEventArray.push({ userId: id, subEventId: event.id })
      })
    })
    const resultUserEvent = await prisma.userEvent.createMany({
      data: UserEventArray
    })

    return NextResponse.json({ success: true, resultUserEvent });
  } catch (error) {
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
