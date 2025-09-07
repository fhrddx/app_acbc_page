declare const emconfig: any;

export type klineParams = {
  code: string;
  container: any;
  canvas: any;
}

export default class kline{
  private code: string;
  private container: any;
  private canvas: any;
  private width: number;
  private height: number;
  private area1: number;
  private area2: number;
  private area3: number;

  constructor(params: klineParams){
    this.code = params.code;
    this.container = params.container;
    this.canvas = params.canvas;
    const { clientHeight, clientWidth } = this.container;
    this.width = clientWidth;
    this.height = clientHeight;
    this.area3 = clientHeight * 0.3;
    this.area2 = clientHeight * 0.1;
    this.area1 = clientHeight * 0.6;
  }

  draw(){
    console.log(this.code + this.container)
    this.fetchData();
  }

  async fetchData(){
    const date = new Date();
    const endDay = `${date.getFullYear()}${(date.getMonth() + 1 + '').padStart(2, '0')}${(date.getDate() + '').padStart(2, '0')}`;
    const length = 66;
    const response = await emconfig.AsyncRequestJsonp.push2his({
      url: 'api/qt/stock/kline/get',
      callbackparm: "cb",
      data: {
        secid: this.code,
        klt: 101,
        fqt: 0,
        lmt: length,
        end: endDay,
        iscca: 1,
        fields1: 'f1,f2,f3,f4,f5',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f60',
        wbp2u: '|0|0|0|ttjj',
        ut: 'f057cbcbce2a86e2866ab8877db1d059',
      }
    });
    console.log('-----begin');
    console.log(JSON.stringify(response.data));
    console.log('------end');
  }


  /*
  push2his
  let result: any = await emconfig.AsyncRequestJsonp.push2({
            url: "api/qt/stock/get",
            callbackparm: "cb",
            data: {
                secid: code,
                ut: "f057cbcbce2a86e2866ab8877db1d059",
                fields: 'f19,f20,f23,f24,f25,f26,f27,f28,f29,f30,f43,f44,f45,f46,f47,f48,f49,f50,f57,f58,f59,f60,f113,f114,f115,f116,f117,f127,f130,f131,f132,f133,f135,f136,f137,f138,f139,f140,f141,f142,f143,f144,f145,f146,f147,f148,f149,f152,f161,f162,f164,f165,f167,f168,f169,f170,f171,f174,f175,f177,f178,f198,f199,f530,f531',
                invt: 2
            }
        });
    */
}

