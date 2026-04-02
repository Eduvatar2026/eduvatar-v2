import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request) {
  const { audioUrl, imageUrl = '/avatar.png' } = await request.json();

  try {
    const output = await replicate.run(
      "douwantech/musetalk",
      { input: { audio: audioUrl, image: imageUrl, fps: 30 } }
    );

    return NextResponse.json({ videoUrl: output[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}