
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
  }
}

