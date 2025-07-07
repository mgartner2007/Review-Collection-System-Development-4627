import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiDownload } = FiIcons;

const QRCodeGenerator = ({ url, size = 200 }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrUrl = await QRCode.toDataURL(url, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    if (url) {
      generateQRCode();
    }
  }, [url, size]);

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = 'review-qr-code.png';
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {qrCodeUrl && (
        <>
          <div className="bg-white p-4 rounded-lg border">
            <img src={qrCodeUrl} alt="QR Code" className="block" />
          </div>
          <button
            onClick={downloadQRCode}
            className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <SafeIcon icon={FiDownload} className="w-4 h-4 mr-2" />
            Download QR Code
          </button>
        </>
      )}
    </div>
  );
};

export default QRCodeGenerator;