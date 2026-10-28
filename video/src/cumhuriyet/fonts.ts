import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@fontsource/playfair-display/700-italic.css';
import { cancelRender, continueRender, delayRender } from 'remotion';

// Türkçe karakterlerin (latin-ext alt kümesi) render'dan önce yüklendiğinden emin ol
const SAMPLE = 'ÇĞİÖŞÜçğıöşü Aa 0123456789';
const handle = delayRender('Fontlar yükleniyor');

Promise.all([
  document.fonts.load(`800 80px Montserrat`, SAMPLE),
  document.fonts.load(`900 80px Montserrat`, SAMPLE),
  document.fonts.load(`italic 700 80px "Playfair Display"`, SAMPLE),
])
  .then(() => continueRender(handle))
  .catch((err) => cancelRender(err));
