<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const emit = defineEmits(['emitQrScanResult', 'emitCameraPermissionAlert']);

const formatsToSupport = [Html5QrcodeSupportedFormats.QR_CODE];
const config = {
  fps: 30
};
const elementName = ref('custom-qr-reader');
const html5QrScanner = ref();

const validateTerminalId = decodedText => {
  return decodedText.length === 13;
};

const initQrScanner = () => {
  Html5Qrcode.getCameras()
    .then(devices => {
      if (devices && devices.length) {
        // const cameraId = devices[0].id;
        html5QrScanner.value = new Html5Qrcode(elementName.value);
        html5QrScanner.value.start(
          { facingMode: 'environment' },
          // cameraId,
          config,
          onScanSuccess
          // onScanFailure
        );
      }
    })
    .catch(err => {
      console.error('QR getCameras failed: ' + err);
      emit('emitCameraPermissionAlert');
    });
};
const stopQrScanner = () => {
  if (html5QrScanner.value) {
    html5QrScanner.value
      .stop()
      .then(ignore => {
        console.log('QR stopped');
      })
      .catch(err => {
        console.error('QR stop failed: ' + err);
      });
  }
};

const onScanSuccess = (decodedText, decodedResult) => {
  if (validateTerminalId(decodedText)) {
    emit('emitQrScanResult', decodedText);
  }
};

// !EXPERIMENTAL
const invertedCanvas = ref(null);

function onScanFailure() {
  const videoElement = document.querySelector(`#${elementName.value} video`);
  if (videoElement) {
    let canvasElement;
    let canvasContext;
    if (invertedCanvas.value) {
      canvasElement = invertedCanvas.value;
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      canvasContext = canvasElement.getContext('2d');
    } else {
      canvasElement = document.createElement('canvas');
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      canvasContext = canvasElement.getContext('2d');
    }

    canvasContext.drawImage(
      videoElement,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    invertColors(canvasContext, canvasElement.width, canvasElement.height);

    canvasElement.toBlob(blob => {
      stopQrScanner();

      html5QrScanner.value
        .scanFile(blob, true)
        .then(decodedText => {
          onScanSuccess(decodedText);
        })
        .catch(err => {
          html5QrScanner.value.start(
            cameraId,
            config,
            onScanSuccess,
            onScanFailure
          );
          console.error('QR scanFile failed: ' + err);
        });
    }, 'image/png');
  }
}

function invertColors(context, width, height) {
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i]; // Red
    data[i + 1] = 255 - data[i + 1]; // Green
    data[i + 2] = 255 - data[i + 2]; // Blue
  }

  context.putImageData(imageData, 0, 0);
}

onMounted(() => {
  initQrScanner();
});
onUnmounted(() => {
  stopQrScanner();
});
</script>

<template>
  <div>
    <div :id="elementName" class="h-[50%] w-full" />
    <canvas ref="invertedCanvas" class="h-[50%] w-full" />
  </div>
</template>

<style></style>
