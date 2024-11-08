<script setup>
import { onMounted, ref } from 'vue';

import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const emit = defineEmits(['emitQrScanResult']);

const formatsToSupport = [Html5QrcodeSupportedFormats.QR_CODE];
const config = {
  fps: 30
};
const elementName = ref('qr-reader');
const html5QrcodeScanner = ref();

const validateTerminalId = decodedText => {
  return decodedText.length === 13;
};
const onScanSuccess = (decodedText, decodedResult) => {
  if (validateTerminalId(decodedText)) {
    emit('emitQrScanResult', decodedText);
  }
};

onMounted(() => {
  html5QrcodeScanner.value = new Html5QrcodeScanner(
    elementName.value,
    config,
    formatsToSupport
  );
  html5QrcodeScanner.value.render(onScanSuccess);
});
</script>

<template>
  <div :id="elementName" />
</template>

<style></style>
