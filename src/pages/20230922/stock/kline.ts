
export type klineParams = {
  code: string;
  container: any;
}

export default class kline{
  private code: string;
  private container: any;

  constructor(params: klineParams){
    this.code = params.code;
    this.container = params.container;
  }

  draw(){
    console.log(this.code + this.container)
  }
}

