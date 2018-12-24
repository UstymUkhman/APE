import MobileDetect from 'mobile-detect';

const IE11 = !!/Trident.*rv:11\./i.test(navigator.userAgent);
const IE10 = !!navigator.userAgent.match(/MSIE 10/i);
const MD = new MobileDetect(navigator.userAgent);

export default {
  // Mobile devices:
  isMobile: !!MD.mobile(),
  isTablet: !!MD.tablet(),
  isPhone: !!MD.phone(),

  // Mobile OS:
  isiOS: !!MD.is('iOS'),
  isiPad: !!MD.is('iPad'),
  isiPhone: !!MD.is('iPhone'),
  isAndroid: !!MD.is('AndroidOS'),
  isWinPhone: !!MD.is('WindowsPhoneOS'),

  // Web browsers:
  safari: /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor),
  edge: !!/Edge\/\d+/i.test(navigator.userAgent),
  firefox: MD.version('Gecko') > 1,
  isIE: IE10 || IE11,
  ie11: IE11,
  ie10: IE10
};
