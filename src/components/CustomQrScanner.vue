<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const emit = defineEmits(['emitQrScanResult']);

const formatsToSupport = [Html5QrcodeSupportedFormats.QR_CODE];
const config = {
  fps: 30,
  formatsToSupport
};
const elementName = ref('custom-qr-reader');
const html5QrScanner = ref();

const validateTerminalId = decodedText => {
  return decodedText.length === 13;
};
const onScanSuccess = (decodedText, decodedResult) => {
  if (validateTerminalId(decodedText)) {
    emit('emitQrScanResult', decodedText);
  }
};

const initQrScanner = () => {
  Html5Qrcode.getCameras()
    .then(devices => {
      if (devices && devices.length) {
        const cameraId = devices[0].id;
        html5QrScanner.value = new Html5Qrcode(elementName.value, {
          formatsToSupport
        });
        html5QrScanner.value.start(
          cameraId,
          config,
          (decodedText, decodedResult) => {
            onScanSuccess(decodedText, decodedResult);
          },
          errorMessage => {
            // ignore error
          }
        );
      }
    })
    .catch(err => {
      console.error(err);
    });
};
const stopQrScanner = () => {
  html5QrScanner.value
    .stop()
    .then(ignore => {
      console.log('QR Scanning stopped');
    })
    .catch(err => {
      console.error(err);
    });
};

onMounted(() => {
  initQrScanner();
});
onUnmounted(() => {
  stopQrScanner();
});
</script>

<template>
  <div :id="elementName" class="h-full w-full" />
</template>

<style></style>
