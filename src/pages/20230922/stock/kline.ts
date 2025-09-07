
export type klineParams = {
  code: string;
  container: any;
  canvas: any;
}

export default class kline{
  private code: string;
  private container: any;
  private canvas: any;

  constructor(params: klineParams){
    this.code = params.code;
    this.container = params.container;
    this.canvas = params.canvas;
    
    alert(this.container.clientHeight);

  }

  draw(){
    console.log(this.code + this.container)
  }
}

