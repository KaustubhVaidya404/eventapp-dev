import fs from 'fs';
import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import path from 'path';

interface IUser {
  id: number;
  name: string;
  email: string;
  phone: bigint;
  imageUrl: string | null;
  class: 'Participant' | 'Admin' | 'Onspot';
}

export default async function createIdCard(user: IUser) {
  const width = 638;  
  const height = 1012;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Simple white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  // Add header section with logo
  try {
    const imgPath = `${process.cwd()}/public/mitlogo.png`
    const logo = await loadImage(imgPath);
    console.log(imgPath)
    
    const logoWidth = 300;
    const logoHeight = 140;
    const logoX = (width - logoWidth) / 2;
    ctx.drawImage(logo, logoX, 40, logoWidth, logoHeight);
  } catch (error) {
    console.error('Error loading MIT logo:', error);
  }

  // Add card type banner
  const bannerHeight = 60;
  ctx.fillStyle = getBannerColor(user.class);
  ctx.fillRect(0, 160, width, bannerHeight);
  
  // Add card type text
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(user.class.toUpperCase(), width / 2, 200);

  // Add user info section with improved styling
  const infoStartY = 280;
  addUserInfo(ctx, user, infoStartY, width);

  // Add QR code with border - increased size
  if (user.imageUrl) {
    try {
      const qrImage = await loadImage(user.imageUrl);
      const qrSize = 400;
      const qrX = (width - qrSize) / 2;
      const qrY = 520;

      // Add subtle border for QR code
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 2;
      ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
    } catch (error) {
      console.error(`Error loading QR code for ${user.name}:`, error);
    }
  }

  // Add simple footer
  addFooter(ctx, width, height);

  // Add border to the entire card
  ctx.strokeStyle = '#dadce0';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Save the image in a temporary directory within the project
  const outputDir = path.join(process.cwd(), 'tmp', 'id_cards');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = path.join(outputDir, `${user.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_id.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(fileName, buffer);

  console.log(`Enhanced ID card created for ${user.name}: ${fileName}`);
  return buffer; // Return the buffer for API response
}

function getBannerColor(userClass: 'Participant' | 'Admin' | 'Onspot'): string {
  const colors = {
    'Participant': '#2196f3',
    'Admin': '#f44336',
    'Onspot': '#4caf50'
  };
  return colors[userClass];
}

function addUserInfo(ctx: CanvasRenderingContext2D, user: IUser, startY: number, width: number) {
  const labels = ['ID', 'Name', 'Email', 'Phone'];
  const values = [user.id, user.name, user.email, formatPhone(user.phone)];
  
  labels.forEach((label, index) => {
    const y = startY + (index * 60);
    
    // Label
    ctx.font = '20px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'left';
    ctx.fillText(label, 40, y);
    
    // Value
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#333333';
    ctx.fillText(values[index].toString(), 40, y + 30);
    
    // Separator line
    if (index < labels.length - 1) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, y + 45);
      ctx.lineTo(width - 40, y + 45);
      ctx.stroke();
    }
  });
}

function formatPhone(phone: bigint): string {
  const phoneStr = phone.toString();
  if (phoneStr.length === 10) {
    return `(${phoneStr.slice(0, 3)}) ${phoneStr.slice(3, 6)}-${phoneStr.slice(6)}`;
  }
  return phoneStr;
}

function addFooter(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const footerY = height - 60;
  
  // Add security text only
  ctx.font = '16px Arial';
  ctx.fillStyle = '#999999';
  ctx.textAlign = 'center';
  ctx.fillText('This ID card is non-transferable and property of MIT', width / 2, footerY);
}