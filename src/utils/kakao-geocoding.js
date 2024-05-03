export default function kakaoGeocode(address) {
  return new Promise((resolve, reject) => {
    var geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, function (result, status) {
      if (status === kakao.maps.services.Status.OK) {
        var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        resolve(coords);
      } else {
        reject(new Error(status));
      }
    });
  });
}