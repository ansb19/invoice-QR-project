import QRCode from 'qrcode';
/*
1. 어떤 주소를 qr로 생성이 가능해야함
2. 생성한 qr을 저장 가능해야함
3. 생성한 qr을 프린터로 인쇄가 가능해야함
4. 
*/

// QRCode.toString('merhaba sila!', function(err,url){
//     console.log(url);
// })

// QRCode.toDataURL('I am a pony!', function (err, url) {
//     console.log(url)
//   })


const generateQR = async text =>{
    try {
        console.log(await QRCode.toString(text)); // toString or toDataURL
        console.log(await QRCode.toDataURL(text));
    }
    catch (err){
        console.error(err);
    }
}

var url = '받아온 주소';
generateQR(url);
// generateQR('https://www.npmjs.com/package/qrcode')