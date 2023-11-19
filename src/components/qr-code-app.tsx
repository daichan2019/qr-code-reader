'use client';

import { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

const QrCodeApp = () => {
  const [isInitialModalVisible, setInitialModalVisible] = useState(false);
  const [spots, setSpots] = useState([
    {
      id: 'spot1',
      qrCode: process.env.NEXT_PUBLIC_SPOT1_URL || '',
      isStamped: false,
    },
    {
      id: 'spot2',
      qrCode: process.env.NEXT_PUBLIC_SPOT2_URL || '',
      isStamped: false,
    },
    {
      id: 'spot3',
      qrCode: process.env.NEXT_PUBLIC_SPOT3_URL || '',
      isStamped: false,
    },
  ]);
  const [allStampsCollected, setAllStampsCollected] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    setInitialModalVisible(!hasVisited);

    const storedSpots = localStorage.getItem('spots');
    if (storedSpots) {
      setSpots(JSON.parse(storedSpots));
    }
  }, []);

  useEffect(() => {
    if (cameraStarted) {
      startCamera();
    }
  }, [cameraStarted]);

  const startCamera = async () => {
    const codeReader = new BrowserMultiFormatReader();
    try {
      const videoInputDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = videoInputDevices.filter(
        (device) => device.kind === 'videoinput'
      );
      if (videoDevices.length === 0) {
        throw new Error('No video devices found.');
      }
      await codeReader.decodeFromVideoDevice(
        videoDevices[0].deviceId,
        videoRef.current,
        (result, error, controls) => {
          if (result) {
            const scannedUrl = result.text;
            setScanResult(scannedUrl); // スキャン結果を保存
            handleQRCodeScan(scannedUrl);
            controls.stop();
            setCameraStarted(false);
          }
          if (error) {
            console.error('QR Code scan error:', error);
          }
        }
      );
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const handleModalClose = () => {
    localStorage.setItem('hasVisited', true);
    setInitialModalVisible(false);
  };

  const handleQRCodeScan = (scannedUrl) => {
    let found = false;
    const updatedSpots = spots.map((spot) => {
      if (spot.qrCode === scannedUrl) {
        found = true;
        return { ...spot, isStamped: true }; // スタンプ状態を更新
      }
      return spot;
    });

    if (found) {
      setScanResult('スタンプを獲得しました！');
    } else {
      setScanResult('このQRコードはスタンプ対象ではありません。');
    }

    setSpots(updatedSpots);
    localStorage.setItem('spots', JSON.stringify(updatedSpots));
    checkAllStampsCollected(updatedSpots);
  };

  const checkAllStampsCollected = (updatedSpots) => {
    const allCollected = updatedSpots.every((spot) => spot.isStamped);
    setAllStampsCollected(allCollected);
    if (allCollected) {
      // 全てのスタンプが集まったら最終モーダルを表示
    }
  };

  const handleStartCameraClick = () => {
    setCameraStarted(true);
  };

  return (
    <div>
      {isInitialModalVisible && (
        <div>
          {/* 初回アクセス時のモーダルの内容 */}
          <button onClick={handleModalClose}>閉じる</button>
        </div>
      )}

      {/* スタンプの状態を表示する部分 */}
      {spots.map((spot) => (
        <div key={spot.id}>
          {spot.isStamped ? 'スタンプ済み' : '未スタンプ'}
        </div>
      ))}

      {!allStampsCollected && (
        <button onClick={handleStartCameraClick}>QRコードをスキャンする</button>
      )}

      {/* QRコードスキャンのためのビデオ要素 */}
      <div style={{ display: cameraStarted ? 'block' : 'none' }}>
        <video
          ref={videoRef}
          id="video"
          width="300"
          height="200"
          style={{ border: '1px solid black' }}
        ></video>
      </div>

      {/* スキャン結果の表示 */}
      <p>スキャン結果: {scanResult}</p>
    </div>
  );
};

export default QrCodeApp;
